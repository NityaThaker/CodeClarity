import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")


def analyze_code(
    student_code: str,
    language: str,
    problem_description: str,
    test_results: list,
    final_score: float,
) -> dict:
    
    passed = len([r for r in test_results if r.get("status") == "passed"])
    total = len(test_results)
    errors = [r.get("error_message") for r in test_results if r.get("error_message")]
    error_text = "\n".join(errors[:3]) if errors else "No errors"

    prompt = f"""You are an expert programming instructor performing a detailed code review.
Analyze the following student code submission and provide structured feedback.

Problem: {problem_description}
Language: {language}
Test Results: {passed}/{total} test cases passed
Final Score: {final_score}/100
Errors encountered: {error_text}

Student Code:
```{language}
{student_code}
```

Provide a detailed code analysis in the following JSON format ONLY. No extra text, no markdown, just the JSON:
{{
    "overall_score": <number 0-10>,
    "summary": "<2-3 sentence overall assessment of the code>",
    "control_flow": {{
        "score": <number 0-10>,
        "feedback": "<detailed paragraph about control flow, loops, conditionals, recursion usage>"
    }},
    "complexity": {{
        "score": <number 0-10>,
        "feedback": "<detailed paragraph about time and space complexity analysis>"
    }},
    "memory": {{
        "score": <number 0-10>,
        "feedback": "<detailed paragraph about memory usage, data structure choices>"
    }},
    "quality": {{
        "score": <number 0-10>,
        "feedback": "<detailed paragraph about code quality, naming, readability, structure>"
    }},
    "optimality": {{
        "score": <number 0-10>,
        "feedback": "<detailed paragraph about whether a better algorithm exists>"
    }},
    "best_practices": {{
        "score": <number 0-10>,
        "feedback": "<detailed paragraph about language-specific best practices>"
    }},
    "next_steps": "<specific actionable recommendations for improvement>"
}}"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.3,
        )
        
        raw = response.choices[0].message.content.strip()
        
        # Clean up response if needed
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        
        data = json.loads(raw)
        return {
            "overall_score": float(data.get("overall_score", 5)),
            "summary": data.get("summary", ""),
            "control_flow_score": float(data["control_flow"]["score"]),
            "control_flow_feedback": data["control_flow"]["feedback"],
            "complexity_score": float(data["complexity"]["score"]),
            "complexity_feedback": data["complexity"]["feedback"],
            "memory_score": float(data["memory"]["score"]),
            "memory_feedback": data["memory"]["feedback"],
            "quality_score": float(data["quality"]["score"]),
            "quality_feedback": data["quality"]["feedback"],
            "optimality_score": float(data["optimality"]["score"]),
            "optimality_feedback": data["optimality"]["feedback"],
            "best_practices_score": float(data["best_practices"]["score"]),
            "best_practices_feedback": data["best_practices"]["feedback"],
            "next_steps": data.get("next_steps", ""),
            "status": "completed",
        }

    except Exception as e:
        return {
            "overall_score": 0,
            "summary": f"Analysis failed: {str(e)}",
            "control_flow_score": 0,
            "control_flow_feedback": "",
            "complexity_score": 0,
            "complexity_feedback": "",
            "memory_score": 0,
            "memory_feedback": "",
            "quality_score": 0,
            "quality_feedback": "",
            "optimality_score": 0,
            "optimality_feedback": "",
            "best_practices_score": 0,
            "best_practices_feedback": "",
            "next_steps": "",
            "status": "failed",
        }