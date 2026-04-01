from dotenv import load_dotenv
load_dotenv()

from app.workers.celery_app import celery_app
from app.db.database import SessionLocal
from app.core.config import USE_CELERY
from app.models.submission import Submission, EvaluationResult, SubmissionStatus, EvaluationStatus
from app.models.testcase import TestCase
from app.models.requirement import Requirement
from app.models.assignment import Assignment
from app.models.code_analysis import CodeAnalysis
from app.services.execution_engine import run_code_in_docker
from app.services.code_analysis_service import analyze_code
from datetime import datetime


def dispatch_evaluation(submission_id: int) -> None:
    if USE_CELERY:
        evaluate_submission.delay(submission_id)
        return
    evaluate_submission(submission_id)


def dispatch_analysis(submission_id: int) -> None:
    if USE_CELERY:
        analyze_submission_code.delay(submission_id)
        return
    analyze_submission_code(submission_id)


@celery_app.task(name="evaluate_submission")
def evaluate_submission(submission_id: int):
    db = SessionLocal()
    try:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            return

        submission.status = SubmissionStatus.RUNNING
        db.commit()

        requirements = (
            db.query(Requirement)
            .filter(Requirement.assignment_id == submission.assignment_id)
            .all()
        )

        total_score = 0.0
        all_results = []

        for requirement in requirements:
            testcases = (
                db.query(TestCase)
                .filter(TestCase.requirement_id == requirement.id)
                .all()
            )

            if not testcases:
                continue

            passed = 0
            for tc in testcases:
                run_result = run_code_in_docker(
                    language=submission.language,
                    code=submission.code,
                    stdin_input=tc.input_data,
                )

                actual_output = run_result["stdout"].strip()
                expected_output = (tc.expected_output or "").strip()
                exec_time = run_result["execution_time_ms"]

                if run_result["status"] == "timeout":
                    status = EvaluationStatus.TIMEOUT
                    points = 0.0
                elif run_result["status"] in ("runtime_error", "error"):
                    status = EvaluationStatus.ERROR
                    points = 0.0
                elif actual_output == expected_output:
                    status = EvaluationStatus.PASSED
                    points = float(tc.points or 0)
                    passed += 1
                else:
                    status = EvaluationStatus.FAILED
                    points = 0.0

                result = EvaluationResult(
                    submission_id=submission.id,
                    requirement_id=requirement.id,
                    testcase_id=tc.id,
                    status=status,
                    actual_output=actual_output,
                    error_message=run_result["stderr"] if run_result["status"] != "success" else None,
                    execution_time_ms=exec_time,
                    points_earned=points,
                )
                db.add(result)
                all_results.append({
                    "status": status,
                    "error_message": run_result["stderr"] if run_result["status"] != "success" else None,
                })

            pass_rate = passed / len(testcases) if testcases else 0
            total_score += pass_rate * float(requirement.weight)

        submission.final_score = round(total_score, 2)
        submission.status = SubmissionStatus.COMPLETED
        submission.completed_at = datetime.utcnow()
        db.commit()

        # Fire code analysis task after evaluation completes
        dispatch_analysis(submission_id)

    except Exception as e:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if submission:
            submission.status = SubmissionStatus.FAILED
            db.commit()
        raise e
    finally:
        db.close()


@celery_app.task(name="analyze_submission_code")
def analyze_submission_code(submission_id: int):
    db = SessionLocal()
    try:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            return

        # Get assignment description
        assignment = db.query(Assignment).filter(
            Assignment.id == submission.assignment_id
        ).first()
        problem_description = assignment.description if assignment else "No description"

        # Get evaluation results
        results = db.query(EvaluationResult).filter(
            EvaluationResult.submission_id == submission_id
        ).all()

        result_dicts = [
            {
                "status": r.status,
                "error_message": r.error_message,
                "actual_output": r.actual_output,
            }
            for r in results
        ]

        # Create pending analysis record
        analysis = CodeAnalysis(
            submission_id=submission_id,
            status="pending",
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        # Run analysis
        analysis_result = analyze_code(
            student_code=submission.code,
            language=submission.language,
            problem_description=problem_description,
            test_results=result_dicts,
            final_score=submission.final_score or 0,
        )

        # Save results
        analysis.overall_score = analysis_result["overall_score"]
        analysis.summary = analysis_result["summary"]
        analysis.control_flow_score = analysis_result["control_flow_score"]
        analysis.control_flow_feedback = analysis_result["control_flow_feedback"]
        analysis.complexity_score = analysis_result["complexity_score"]
        analysis.complexity_feedback = analysis_result["complexity_feedback"]
        analysis.memory_score = analysis_result["memory_score"]
        analysis.memory_feedback = analysis_result["memory_feedback"]
        analysis.quality_score = analysis_result["quality_score"]
        analysis.quality_feedback = analysis_result["quality_feedback"]
        analysis.optimality_score = analysis_result["optimality_score"]
        analysis.optimality_feedback = analysis_result["optimality_feedback"]
        analysis.best_practices_score = analysis_result["best_practices_score"]
        analysis.best_practices_feedback = analysis_result["best_practices_feedback"]
        analysis.next_steps = analysis_result["next_steps"]
        analysis.status = analysis_result["status"]
        db.commit()

    except Exception as e:
        print(f"Code analysis failed: {e}")
    finally:
        db.close()
