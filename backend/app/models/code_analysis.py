from sqlalchemy import Column, Integer, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class CodeAnalysis(Base):
    __tablename__ = "code_analyses"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, unique=True)
    
    # Per category scores (0-10)
    control_flow_score = Column(Float, nullable=True)
    complexity_score = Column(Float, nullable=True)
    memory_score = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)
    optimality_score = Column(Float, nullable=True)
    best_practices_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)

    # Per category feedback paragraphs
    control_flow_feedback = Column(Text, nullable=True)
    complexity_feedback = Column(Text, nullable=True)
    memory_feedback = Column(Text, nullable=True)
    quality_feedback = Column(Text, nullable=True)
    optimality_feedback = Column(Text, nullable=True)
    best_practices_feedback = Column(Text, nullable=True)

    # Summary and next steps
    summary = Column(Text, nullable=True)
    next_steps = Column(Text, nullable=True)

    status = Column(Text, default="pending")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", backref="code_analysis")