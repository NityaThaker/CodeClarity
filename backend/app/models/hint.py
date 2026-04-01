from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class Hint(Base):
    __tablename__ = "hints"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hint_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", backref="hints")
    requirement = relationship("Requirement", backref="hints")
    student = relationship("User", backref="hints")