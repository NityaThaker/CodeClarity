from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.core.config import USE_CELERY
from app.core.dependencies import get_current_user
from app.models.submission import Submission, EvaluationResult, SubmissionStatus
from app.models.assignment import Assignment
from app.schemas.submission import SubmissionCreate, SubmissionOut
from app.workers.tasks import dispatch_evaluation
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/submissions", status_code=202)
def create_submission(
    payload: SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Validate language
    allowed = ["python", "java", "cpp", "javascript"]
    if payload.language not in allowed:
        raise HTTPException(status_code=400, detail=f"Language must be one of {allowed}")

    # Validate assignment exists and is published
    assignment = db.query(Assignment).filter(Assignment.id == payload.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if not assignment.is_published:
        raise HTTPException(status_code=400, detail="Assignment is not published yet")

    # Count previous attempts
    attempt_count = (
        db.query(Submission)
        .filter(
            Submission.assignment_id == payload.assignment_id,
            Submission.student_id == current_user["user_id"],
        )
        .count()
    )

    submission = Submission(
        assignment_id=payload.assignment_id,
        student_id=current_user["user_id"],
        language=payload.language,
        code=payload.code,
        status=SubmissionStatus.PENDING,
        attempt_number=attempt_count + 1,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Demo deployments on free tiers can run without a separate worker.
    if USE_CELERY:
        dispatch_evaluation(submission.id)
    else:
        background_tasks.add_task(dispatch_evaluation, submission.id)

    return {"submission_id": submission.id, "status": "pending", "message": "Submission received and queued for evaluation"}

@router.get("/submissions/mine")
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    submissions = (
        db.query(Submission)
        .filter(Submission.student_id == current_user["user_id"])
        .order_by(Submission.submitted_at.desc())
        .all()
    )
    from app.schemas.submission import SubmissionOut
    return submissions

@router.get("/submissions/{submission_id}/results", response_model=SubmissionOut)
def get_submission_results(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Students can only see their own submissions
    if current_user["role"] == "student" and submission.student_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access forbidden")

    return submission
