import json
import re
from app.services.opencode_bridge import call_opencode, call_opencode_json

GENERATE_PROMPT = """You are an ATS optimization expert and Senior Technical Recruiter.

Generate an ATS-optimized resume tailored specifically for the given job description.

RULES:
- Never fabricate experience or skills
- Rephrase and restructure EXISTING experience to highlight relevant keywords from the job description
- Use strong action verbs and quantified achievements from the original resume
- Match the job description's required skills and experience level
- Use standard ATS-friendly section headers
- No columns, tables, graphics, or special characters
- Output in clean plain text
- Include a "Match Summary" at the top explaining why this candidate fits

Return BOTH:
1. The tailored resume
2. A match explanation (what was changed and why)

Format as JSON:
{
  "resume": "full rewritten resume text",
  "match_explanation": "explanation of tailoring choices",
  "ats_score": 0-100
}"""


async def generate_ats_resume(resume_text: str, job_title: str, company: str, job_description: str) -> dict:
    prompt = (
        f"Original Resume:\n{resume_text}\n\n"
        f"Target Job: {job_title} at {company}\n"
        f"Job Description:\n{job_description}\n\n"
        f"Generate an ATS-optimized resume. Return ONLY valid JSON."
    )
    
    result = call_opencode_json(prompt, GENERATE_PROMPT)
    
    if "error" in result:
        # Attempt to extract JSON from raw text as fallback
        raw = result.get("raw", "")
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        return {
            "resume": raw,
            "match_explanation": "AI-generated tailored version",
            "ats_score": 70
        }
    return result
