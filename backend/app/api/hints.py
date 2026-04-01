from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.core.dependencies import get_current_user
from app.models.hint import Hint
from app.models.submission import Submission, EvaluationResult, EvaluationStatus
from app.models.requirement import Requirement
from app.services.hint_service import generate_hint

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/hints")
def request_hint(
    submission_id: int,
    requirement_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Verify submission exists and belongs to student
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user["role"] == "student" and submission.student_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access forbidden")

    # Verify requirement exists
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    # Check if submission is completed
    if submission.status != "completed":
        raise HTTPException(status_code=400, detail="Submission is still being evaluated")

    # Check if a hint already exists for this submission + requirement
    existing_hint = db.query(Hint).filter(
        Hint.submission_id == submission_id,
        Hint.requirement_id == requirement_id,
        Hint.student_id == current_user["user_id"],
    ).first()

    if existing_hint:
        return {"hint": existing_hint.hint_text, "cached": True}

    # Get the failed test result for this requirement
    failed_result = db.query(EvaluationResult).filter(
        EvaluationResult.submission_id == submission_id,
        EvaluationResult.requirement_id == requirement_id,
        EvaluationResult.status.in_(["failed", "error", "timeout"]),
    ).first()

    if not failed_result:
        return {"hint": "Great job! You passed all test cases for this requirement.", "cached": False}

    # Generate hint using Groq
    try:
        hint_text = generate_hint(
            student_code=submission.code,
            language=submission.language,
            requirement_description=requirement.description,
            actual_output=failed_result.actual_output or "",
            expected_output="Check the test case expected output",
            error_message=failed_result.error_message,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hint generation failed: {str(e)}")

    # Save hint to database
    hint = Hint(
        submission_id=submission_id,
        requirement_id=requirement_id,
        student_id=current_user["user_id"],
        hint_text=hint_text,
    )
    db.add(hint)
    db.commit()

    return {"hint": hint_text, "cached": False}


@router.get("/hints/{submission_id}")
def get_hints_for_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user["role"] == "student" and submission.student_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access forbidden")

    hints = db.query(Hint).filter(Hint.submission_id == submission_id).all()

    return {
        "submission_id": submission_id,
        "hints": [
            {
                "requirement_id": h.requirement_id,
                "hint_text": h.hint_text,
                "created_at": h.created_at,
            }
            for h in hints
        ]
    }