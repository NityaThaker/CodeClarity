from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.core.dependencies import get_current_user
from app.models.code_analysis import CodeAnalysis
from app.models.submission import Submission

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/submissions/{submission_id}/analysis")
def get_code_analysis(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user["role"] == "student" and submission.student_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access forbidden")

    analysis = db.query(CodeAnalysis).filter(
        CodeAnalysis.submission_id == submission_id
    ).first()

    if not analysis:
        return {"status": "pending", "message": "Analysis not yet available"}

    return {
        "status": analysis.status,
        "overall_score": analysis.overall_score,
        "summary": analysis.summary,
        "categories": [
            {
                "name": "Control Flow",
                "score": analysis.control_flow_score,
                "feedback": analysis.control_flow_feedback,
                "icon": "git-branch",
            },
            {
                "name": "Time Complexity",
                "score": analysis.complexity_score,
                "feedback": analysis.complexity_feedback,
                "icon": "clock",
            },
            {
                "name": "Memory Usage",
                "score": analysis.memory_score,
                "feedback": analysis.memory_feedback,
                "icon": "cpu",
            },
            {
                "name": "Code Quality",
                "score": analysis.quality_score,
                "feedback": analysis.quality_feedback,
                "icon": "star",
            },
            {
                "name": "Optimality",
                "score": analysis.optimality_score,
                "feedback": analysis.optimality_feedback,
                "icon": "zap",
            },
            {
                "name": "Best Practices",
                "score": analysis.best_practices_score,
                "feedback": analysis.best_practices_feedback,
                "icon": "shield",
            },
        ],
        "next_steps": analysis.next_steps,
    }