from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime
import enum

class SubmissionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class EvaluationStatus(str, enum.Enum):
    PASSED = "passed"
    FAILED = "failed"
    ERROR = "error"
    TIMEOUT = "timeout"
    MEMORY_EXCEEDED = "memory_exceeded"

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    language = Column(String(20), nullable=False)
    code = Column(Text, nullable=False)
    status = Column(String(20), default=SubmissionStatus.PENDING)
    final_score = Column(Float, nullable=True)
    attempt_number = Column(Integer, default=1)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    assignment = relationship("Assignment", backref="submissions")
    student = relationship("User", backref="submissions")
    results = relationship("EvaluationResult", back_populates="submission", cascade="all, delete-orphan")


class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    testcase_id = Column(Integer, ForeignKey("test_cases.id"), nullable=False)
    status = Column(String(30), nullable=False)
    actual_output = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    memory_used_mb = Column(Float, nullable=True)
    points_earned = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="results")
    requirement = relationship("Requirement", backref="evaluation_results")
    testcase = relationship("TestCase", backref="evaluation_results")