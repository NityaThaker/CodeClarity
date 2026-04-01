import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

def generate_hint(
    student_code: str,
    language: str,
    requirement_description: str,
    actual_output: str,
    expected_output: str,
    error_message: str = None,
) -> str:
    
    error_section = ""
    if error_message:
        error_section = f"\nError message: {error_message}"

    prompt = f"""You are a helpful programming tutor assistant for university students.
A student submitted code for a programming assignment and their code failed a requirement.
Your job is to give them a short Socratic hint that guides them toward the solution WITHOUT giving away the answer.

Rules:
- Never write the correct code for them
- Never say "you should do X" directly
- Ask guiding questions or point out what to think about
- Keep it to 2-3 sentences maximum
- Be encouraging and friendly
- Focus only on the specific failure

Assignment requirement: {requirement_description}
Programming language: {language}

Student's code:
{student_code}

Expected output: {expected_output}
Actual output: {actual_output}{error_section}

Give a short Socratic hint to help the student figure out what went wrong:"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=150,
        temperature=0.7,
    )

    return response.choices[0].message.content.strip()