from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.core.dependencies import get_current_user
from app.models.submission import Submission, EvaluationResult
from app.models.assignment import Assignment
from app.models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/analytics/student/me")
def get_student_analytics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student_id = current_user["user_id"]

    submissions = db.query(Submission).filter(
        Submission.student_id == student_id,
        Submission.status == "completed"
    ).order_by(Submission.submitted_at.asc()).all()

    total_submissions = len(submissions)
    scores = [s.final_score for s in submissions if s.final_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0
    completed = len([s for s in submissions if s.final_score and s.final_score >= 50])

    score_trend = [
        {
            "name": f"#{i+1}",
            "score": round(s.final_score, 1),
            "assignment_id": s.assignment_id,
            "date": s.submitted_at.strftime("%b %d"),
        }
        for i, s in enumerate(submissions)
        if s.final_score is not None
    ]

    return {
        "total_submissions": total_submissions,
        "avg_score": avg_score,
        "completed": completed,
        "score_trend": score_trend,
    }


# ── IMPORTANT: overview must come BEFORE {assignment_id} ──
@router.get("/analytics/instructor/overview")
def get_instructor_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    instructor_id = current_user["user_id"]

    assignments = db.query(Assignment).filter(
        Assignment.instructor_id == instructor_id
    ).all()

    assignment_ids = [a.id for a in assignments]

    if not assignment_ids:
        return {
            "total_assignments": 0,
            "total_submissions": 0,
            "avg_score": 0,
            "students": [],
        }

    submissions = db.query(Submission).filter(
        Submission.assignment_id.in_(assignment_ids),
        Submission.status == "completed"
    ).all()

    scores = [s.final_score for s in submissions if s.final_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    # Real student data
    student_best = {}
    for s in submissions:
        sid = s.student_id
        if sid not in student_best:
            student_best[sid] = {
                "score": s.final_score or 0,
                "submissions": 0,
                "last_active": s.submitted_at,
            }
        if (s.final_score or 0) > student_best[sid]["score"]:
            student_best[sid]["score"] = s.final_score or 0
        student_best[sid]["submissions"] += 1
        if s.submitted_at > student_best[sid]["last_active"]:
            student_best[sid]["last_active"] = s.submitted_at

    student_ids = list(student_best.keys())
    students = db.query(User).filter(User.id.in_(student_ids)).all()
    student_map = {s.id: s.full_name or s.username for s in students}

    student_list = []
    for sid, data in student_best.items():
        student_list.append({
            "name": student_map.get(sid, f"Student {sid}"),
            "submissions": data["submissions"],
            "best_score": round(data["score"], 1),
            "last_active": data["last_active"].strftime("%b %d, %Y"),
        })

    student_list.sort(key=lambda x: x["best_score"], reverse=True)

    return {
        "total_assignments": len(assignments),
        "total_submissions": len(submissions),
        "avg_score": avg_score,
        "students": student_list,
    }


@router.get("/analytics/instructor/{assignment_id}")
def get_assignment_analytics(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    submissions = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.status == "completed"
    ).all()

    scores = [s.final_score for s in submissions if s.final_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    distribution = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for score in scores:
        if score <= 20: distribution["0-20"] += 1
        elif score <= 40: distribution["21-40"] += 1
        elif score <= 60: distribution["41-60"] += 1
        elif score <= 80: distribution["61-80"] += 1
        else: distribution["81-100"] += 1

    student_best = {}
    for s in submissions:
        sid = s.student_id
        if sid not in student_best or s.final_score > student_best[sid]["score"]:
            student_best[sid] = {
                "student_id": sid,
                "score": s.final_score,
                "submissions": 0,
                "last_active": s.submitted_at,
            }
        student_best[sid]["submissions"] += 1
        if s.submitted_at > student_best[sid]["last_active"]:
            student_best[sid]["last_active"] = s.submitted_at

    student_ids = list(student_best.keys())
    students = db.query(User).filter(User.id.in_(student_ids)).all()
    student_map = {s.id: s.full_name or s.username for s in students}

    student_list = []
    for sid, data in student_best.items():
        student_list.append({
            "name": student_map.get(sid, f"Student {sid}"),
            "submissions": data["submissions"],
            "best_score": round(data["score"], 1),
            "last_active": data["last_active"].strftime("%b %d, %Y"),
        })

    student_list.sort(key=lambda x: x["best_score"], reverse=True)

    error_results = db.query(EvaluationResult).join(Submission).filter(
        Submission.assignment_id == assignment_id,
        EvaluationResult.error_message.isnot(None)
    ).all()

    error_counts = {}
    for r in error_results:
        msg = r.error_message or ""
        if "SyntaxError" in msg or "syntax" in msg.lower():
            key = "Syntax Error"
        elif "IndexError" in msg or "index" in msg.lower():
            key = "Index Out of Bounds"
        elif "TypeError" in msg or "type" in msg.lower():
            key = "Type Mismatch"
        elif "timeout" in msg.lower():
            key = "Timeout"
        elif "NameError" in msg:
            key = "Name Error"
        else:
            key = "Runtime Error"
        error_counts[key] = error_counts.get(key, 0) + 1

    common_errors = [
        {"type": k, "count": v}
        for k, v in sorted(error_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "total_submissions": len(submissions),
        "avg_score": avg_score,
        "score_distribution": [
            {"range": k, "count": v} for k, v in distribution.items()
        ],
        "students": student_list,
        "common_errors": common_errors,
    }

@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    submissions = db.query(Submission).filter(
        Submission.status == "completed"
    ).all()

    student_best = {}
    for s in submissions:
        sid = s.student_id
        if sid not in student_best:
            student_best[sid] = {"score": s.final_score or 0, "submissions": 0}
        if (s.final_score or 0) > student_best[sid]["score"]:
            student_best[sid]["score"] = s.final_score or 0
        student_best[sid]["submissions"] += 1

    student_ids = list(student_best.keys())
    students = db.query(User).filter(User.id.in_(student_ids)).all()
    student_map = {s.id: s.full_name or s.username for s in students}

    result = [
        {
            "name": student_map.get(sid, f"Student {sid}"),
            "best_score": round(data["score"], 1),
            "submissions": data["submissions"],
        }
        for sid, data in student_best.items()
    ]
    result.sort(key=lambda x: x["best_score"], reverse=True)
    return result