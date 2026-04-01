from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

class RequirementType(str, enum.Enum):
    functional = "functional"
    performance = "performance"
    quality = "quality"

class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    description = Column(String(500), nullable=False)
    requirement_type = Column(String(20), default="functional")
    weight = Column(Float, nullable=False)
    priority = Column(Integer, default=1)

    assignment = relationship("Assignment", back_populates="requirements")
    test_cases = relationship("TestCase", back_populates="requirement", cascade="all, delete-orphan")