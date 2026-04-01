from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.assignment import Assignment
from app.models.requirement import Requirement
from app.models.testcase import TestCase
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate

def validate_weights(requirements):
    if not requirements:
        return
    total = sum(r.weight for r in requirements)
    if round(total, 2) != 100.0:
        raise HTTPException(
            status_code=400,
            detail=f"Requirement weights must sum to exactly 100. Current total: {total}"
        )

def create_assignment(db: Session, data: AssignmentCreate, instructor_id: int):
    assignment = Assignment(
        title=data.title,
        description=data.description,
        deadline=data.deadline,
        difficulty_level=data.difficulty_level,
        instructor_id=instructor_id,
        is_published=False
    )
    db.add(assignment)
    db.flush()

    for req_data in data.requirements:
        requirement = Requirement(
            assignment_id=assignment.id,
            description=req_data.description,
            requirement_type=req_data.requirement_type,
            weight=req_data.weight,
            priority=req_data.priority
        )
        db.add(requirement)
        db.flush()

        for tc_data in req_data.test_cases:
            test_case = TestCase(
                requirement_id=requirement.id,
                input_data=tc_data.input_data,
                expected_output=tc_data.expected_output,
                is_sample=tc_data.is_sample,
                points=tc_data.points,
                time_limit=tc_data.time_limit,
                memory_limit=tc_data.memory_limit
            )
            db.add(test_case)

    db.commit()
    db.refresh(assignment)
    return assignment

def get_assignment(db: Session, assignment_id: int):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

def get_all_assignments(db: Session, published_only: bool = False):
    query = db.query(Assignment)
    if published_only:
        query = query.filter(Assignment.is_published == True)
    return query.all()

def get_instructor_assignments(db: Session, instructor_id: int):
    return db.query(Assignment).filter(Assignment.instructor_id == instructor_id).all()

def update_assignment(db: Session, assignment_id: int, data: AssignmentUpdate, instructor_id: int):
    assignment = get_assignment(db, assignment_id)
    if assignment.instructor_id != instructor_id:
        raise HTTPException(status_code=403, detail="Not your assignment")
    if assignment.is_published:
        raise HTTPException(status_code=400, detail="Cannot edit a published assignment")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(assignment, field, value)
    db.commit()
    db.refresh(assignment)
    return assignment

def publish_assignment(db: Session, assignment_id: int, instructor_id: int):
    assignment = get_assignment(db, assignment_id)
    if assignment.instructor_id != instructor_id:
        raise HTTPException(status_code=403, detail="Not your assignment")
    if assignment.is_published:
        raise HTTPException(status_code=400, detail="Assignment already published")
    if not assignment.requirements:
        raise HTTPException(status_code=400, detail="Assignment must have at least one requirement before publishing")
    for req in assignment.requirements:
        if not req.test_cases:
            raise HTTPException(
                status_code=400,
                detail=f"Requirement '{req.description}' has no test cases"
            )
    validate_weights(assignment.requirements)
    assignment.is_published = True
    db.commit()
    db.refresh(assignment)
    return assignment

def delete_assignment(db: Session, assignment_id: int, instructor_id: int):
    assignment = get_assignment(db, assignment_id)
    if assignment.instructor_id != instructor_id:
        raise HTTPException(status_code=403, detail="Not your assignment")
    if assignment.is_published:
        raise HTTPException(status_code=400, detail="Cannot delete a published assignment")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully"}