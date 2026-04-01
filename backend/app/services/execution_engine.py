import subprocess
import tempfile
import os
import time
from typing import Optional

LANGUAGE_CONFIG = {
    "python": {
        "filename": "solution.py",
        "run_cmd": ["python", "solution.py"],
        "compile_cmd": None,
    },
    "javascript": {
        "filename": "solution.js",
        "run_cmd": ["node", "solution.js"],
        "compile_cmd": None,
    },
    "java": {
        "filename": "Solution.java",
        "run_cmd": ["java", "Solution"],
        "compile_cmd": ["javac", "Solution.java"],
    },
    "cpp": {
        "filename": "solution.cpp",
        "run_cmd": ["./solution"],
        "compile_cmd": ["g++", "-o", "solution", "solution.cpp"],
    },
}

MAX_EXECUTION_TIME = 10  # seconds


def run_code_in_docker(
    language: str,
    code: str,
    stdin_input: Optional[str] = None,
) -> dict:
    """
    Runs student code in a subprocess sandbox.
    """
    config = LANGUAGE_CONFIG.get(language)
    if not config:
        return {
            "status": "error",
            "stdout": "",
            "stderr": f"Unsupported language: {language}",
            "execution_time_ms": 0,
        }

    with tempfile.TemporaryDirectory() as tmpdir:
        code_path = os.path.join(tmpdir, config["filename"])
        with open(code_path, "w", encoding="utf-8") as f:
            f.write(code)

        # Compile if needed
        if config["compile_cmd"]:
            try:
                compile_result = subprocess.run(
                    config["compile_cmd"],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=30,
                )
                if compile_result.returncode != 0:
                    return {
                        "status": "runtime_error",
                        "stdout": "",
                        "stderr": compile_result.stderr.strip(),
                        "execution_time_ms": 0,
                    }
            except Exception as e:
                return {
                    "status": "error",
                    "stdout": "",
                    "stderr": str(e),
                    "execution_time_ms": 0,
                }

        # Run the code
        try:
            start_time = time.time()
            result = subprocess.run(
                config["run_cmd"],
                cwd=tmpdir,
                input=stdin_input or "",
                capture_output=True,
                text=True,
                timeout=MAX_EXECUTION_TIME,
            )
            elapsed_ms = (time.time() - start_time) * 1000

            if result.returncode != 0:
                return {
                    "status": "runtime_error",
                    "stdout": result.stdout.strip(),
                    "stderr": result.stderr.strip(),
                    "execution_time_ms": elapsed_ms,
                }

            return {
                "status": "success",
                "stdout": result.stdout.strip(),
                "stderr": "",
                "execution_time_ms": elapsed_ms,
            }

        except subprocess.TimeoutExpired:
            return {
                "status": "timeout",
                "stdout": "",
                "stderr": "Execution timed out",
                "execution_time_ms": MAX_EXECUTION_TIME * 1000,
            }
        except Exception as e:
            return {
                "status": "error",
                "stdout": "",
                "stderr": str(e),
                "execution_time_ms": 0,
            }
