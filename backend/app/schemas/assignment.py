from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TestCaseCreate(BaseModel):
    input_data: str
    expected_output: str
    is_sample: bool = False
    points: int
    time_limit: int = 30
    memory_limit: int = 512

class TestCaseResponse(BaseModel):
    id: int
    input_data: str
    expected_output: str
    is_sample: bool
    points: int
    time_limit: int
    memory_limit: int

    class Config:
        from_attributes = True

class RequirementCreate(BaseModel):
    description: str
    requirement_type: str = "functional"
    weight: float
    priority: int = 1
    test_cases: List[TestCaseCreate] = []

class RequirementResponse(BaseModel):
    id: int
    description: str
    requirement_type: str
    weight: float
    priority: int
    test_cases: List[TestCaseResponse] = []

    class Config:
        from_attributes = True

class AssignmentCreate(BaseModel):
    title: str
    description: str
    deadline: datetime
    difficulty_level: str = "medium"
    requirements: List[RequirementCreate] = []

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    difficulty_level: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: int
    title: str
    description: str
    deadline: datetime
    difficulty_level: str
    is_published: bool
    instructor_id: int
    created_at: datetime
    requirements: List[RequirementResponse] = []

    class Config:
        from_attributes = True