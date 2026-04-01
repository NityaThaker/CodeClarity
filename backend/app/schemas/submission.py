from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SubmissionCreate(BaseModel):
    assignment_id: int
    language: str  # python, java, cpp, javascript
    code: str

class EvaluationResultOut(BaseModel):
    id: int
    requirement_id: int
    testcase_id: int
    status: str
    actual_output: Optional[str]
    error_message: Optional[str]
    execution_time_ms: Optional[float]
    points_earned: float

    class Config:
        from_attributes = True

class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    language: str
    status: str
    final_score: Optional[float]
    attempt_number: int
    submitted_at: datetime
    completed_at: Optional[datetime]
    results: List[EvaluationResultOut] = []

    class Config:
        from_attributes = True