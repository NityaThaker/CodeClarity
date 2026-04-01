from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import SessionLocal
from app.schemas.assignment import (
    AssignmentCreate, AssignmentUpdate,
    AssignmentResponse, RequirementCreate,
    RequirementResponse, TestCaseCreate, TestCaseResponse
)
from app.core.dependencies import require_role, get_current_user
from app.services.assignment_service import (
    create_assignment, get_assignment, get_all_assignments,
    get_instructor_assignments, update_assignment,
    publish_assignment, delete_assignment
)
from app.models.requirement import Requirement
from app.models.testcase import TestCase

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# instructor: create assignment
@router.post("/assignments", response_model=AssignmentResponse)
def create(data: AssignmentCreate, db: Session = Depends(get_db), user=Depends(require_role("instructor"))):
    return create_assignment(db, data, instructor_id=user["user_id"])

# instructor: get their own assignments
@router.get("/assignments/mine", response_model=List[AssignmentResponse])
def get_mine(db: Session = Depends(get_db), user=Depends(require_role("instructor"))):
    return get_instructor_assignments(db, instructor_id=user["user_id"])

# student: get all published assignments
@router.get("/assignments", response_model=List[AssignmentResponse])
def get_published(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_all_assignments(db, published_only=True)

# both: get single assignment by id
@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
def get_one(assignment_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_assignment(db, assignment_id)

# instructor: update assignment
@router.put("/assignments/{assignment_id}", response_model=AssignmentResponse)
def update(assignment_id: int, data: AssignmentUpdate, db: Session = Depends(get_db), user=Depends(require_role("instructor"))):
    return update_assignment(db, assignment_id, data, instructor_id=user["user_id"])

# instructor: publish assignment
@router.post("/assignments/{assignment_id}/publish", response_model=AssignmentResponse)
def publish(assignment_id: int, db: Session = Depends(get_db), user=Depends(require_role("instructor"))):
    return publish_assignment(db, assignment_id, instructor_id=user["user_id"])

# instructor: delete assignment
@router.delete("/assignments/{assignment_id}")
def delete(assignment_id: int, db: Session = Depends(get_db), user=Depends(require_role("instructor"))):
    return delete_assignment(db, assignment_id, instructor_id=user["user_id"])

# instructor: add requirement to existing assignment
@router.post("/assignments/{assignment_id}/requirements", response_model=RequirementResponse)
def add_requirement(assignment_id: int, data: RequirementCreate, db: Session = Depends(get_db), user=Depends(require_role("instructor"))):
    assignment = get_assignment(db, assignment_id)
    if assignment.instructor_id != user["user_id"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not your assignment")
    requirement = Requirement(
        assignment_id=assignment_id,
        description=data.description,
        requirement_type=data.requirement_type,
        weight=data.weight,
        priority=data.priority
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement

# instructor: add test case to requirement
@router.post("/requirements/{requirement_id}/testcases", response_model=TestCaseResponse)
def add_testcase(requirement_id: int, data: TestCaseCreate, db: Session = Depends(get_db), user=Depends(require_role("instructor"))):
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Requirement not found")
    test_case = TestCase(
        requirement_id=requirement_id,
        input_data=data.input_data,
        expected_output=data.expected_output,
        is_sample=data.is_sample,
        points=data.points,
        time_limit=data.time_limit,
        memory_limit=data.memory_limit
    )
    db.add(test_case)
    db.commit()
    db.refresh(test_case)
    return test_case