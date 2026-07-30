import json
from app.services.opencode_bridge import call_opencode, call_opencode_json

AUDIT_SYSTEM_PROMPT = """You are a Principal Technical Recruiter and Staff Engineer conducting a resume review.

Analyze the resume and return a JSON object with:
- score (0-100): overall quality score
- strengths: list of what stands out positively
- weaknesses: list of gaps and problems
- suggestions: list of specific, actionable improvements
- ats_analysis: object containing keyword_density, format_issues, missing_sections, recommended_keywords, ats_score

Be brutally honest. Do not flatter. Focus on what a hiring manager at a top tech company would think."""


async def audit_resume(resume_text: str, job_description: str = "") -> dict:
    prompt = f"Resume:\n{resume_text}\n\n"
    if job_description:
        prompt += f"Target Job Description:\n{job_description}\n\n"
    prompt += "Perform a comprehensive audit. Return ONLY valid JSON."
    
    result = call_opencode_json(prompt, AUDIT_SYSTEM_PROMPT)
    
    if "error" in result:
        return {
            "score": 50,
            "strengths": ["Resume submitted for analysis"],
            "weaknesses": ["Analysis temporarily unavailable"],
            "suggestions": ["Try again later"],
            "ats_analysis": {
                "keyword_density": "unknown",
                "format_issues": [],
                "missing_sections": [],
                "recommended_keywords": [],
                "ats_score": 50
            }
        }
    return result


ATS_OPTIMIZE_PROMPT = """You are an ATS optimization expert and Staff Engineer.

Rewrite the resume to maximize ATS score for the target job description.
- Use keywords from the job description naturally
- Keep the same facts — never fabricate
- Use standard section headers (Experience, Education, Skills, Projects)
- Use strong action verbs
- Quantify achievements where possible
- Output in plain text format suitable for ATS parsing

Return ONLY the rewritten resume, no explanation."""


async def optimize_for_ats(resume_text: str, job_description: str) -> str:
    prompt = f"RESUME:\n{resume_text}\n\nTARGET JOB:\n{job_description}\n\nRewrite this resume for maximum ATS compatibility."
    return call_opencode(prompt, ATS_OPTIMIZE_PROMPT)


MATCH_SCORE_PROMPT = """You are a Technical Recruiter matching candidates to jobs.

Analyze how well the resume matches the job description.
Return ONLY a JSON object:
- match_score: 0-100
- matching_skills: list
- missing_skills: list
- overall_assessment: str"""


async def calculate_match_score(resume_text: str, job_description: str) -> dict:
    prompt = f"RESUME:\n{resume_text}\n\nJOB DESCRIPTION:\n{job_description}\n\nCalculate match score. Return ONLY valid JSON."
    result = call_opencode_json(prompt, MATCH_SCORE_PROMPT)
    if "error" in result:
        return {"match_score": 50, "matching_skills": [], "missing_skills": [], "overall_assessment": "Analysis temporarily unavailable"}
    return result
