from app.services.opencode_bridge import call_opencode

CONTENT_SYSTEM_PROMPT = """You are a Technical Content Strategist and Personal Branding Consultant.

Generate high-credibility technical content based on project details.
Never write generic LinkedIn fluff. Every piece must demonstrate genuine technical depth.
Use clear, direct language. Avoid clichés like "passionate", "thrilled", "excited to share".
Focus on architecture decisions, trade-offs, and lessons learned."""


async def generate_linkedin_post(project: str, topic: str = "", tone: str = "professional") -> str:
    prompt = (
        f"Project: {project}\n"
        f"{'Topic: ' + topic if topic else ''}\n"
        f"Tone: {tone}\n\n"
        f"Write a LinkedIn post (250-500 words) about this project. "
        f"Include technical depth: architecture decisions, trade-offs, or lessons learned. "
        f"End with a question or call to action. No emojis."
    )
    return call_opencode(prompt, CONTENT_SYSTEM_PROMPT)


async def generate_blog_post(project: str, topic: str = "") -> str:
    prompt = (
        f"Project: {project}\n"
        f"{'Topic: ' + topic if topic else ''}\n\n"
        f"Write a technical blog post (800-1500 words). "
        f"Structure: problem statement, architecture approach, implementation details, "
        f"trade-offs, benchmarks if applicable, lessons learned. "
        f"Use code snippets where relevant. No fluff."
    )
    return call_opencode(prompt, CONTENT_SYSTEM_PROMPT)


async def generate_twitter_thread(project: str, topic: str = "") -> str:
    prompt = (
        f"Project: {project}\n"
        f"{'Topic: ' + topic if topic else ''}\n\n"
        f"Write a Twitter/X thread (8-15 tweets) explaining this project or concept. "
        f"Each tweet should be under 280 characters. "
        f"Number each tweet. Make it engaging and technically informative."
    )
    return call_opencode(prompt, CONTENT_SYSTEM_PROMPT)


async def generate_architecture_post(project: str, architecture_desc: str = "") -> str:
    prompt = (
        f"Project: {project}\n"
        f"{'Architecture: ' + architecture_desc if architecture_desc else ''}\n\n"
        f"Write an architecture deep-dive post explaining the system design. "
        f"Include: why specific technologies were chosen, trade-offs made, "
        f"scalability considerations, and what you would do differently. "
        f"Target audience: senior engineers and engineering managers."
    )
    return call_opencode(prompt, CONTENT_SYSTEM_PROMPT)


CONTENT_TYPES = {
    "linkedin_post": generate_linkedin_post,
    "blog": generate_blog_post,
    "twitter_thread": generate_twitter_thread,
    "architecture_post": generate_architecture_post,
}


async def generate_content(content_type: str, source_project: str = "", topic: str = "", tone: str = "professional") -> str:
    generator = CONTENT_TYPES.get(content_type)
    if not generator:
        return f"Unknown content type: {content_type}"
    return await generator(source_project, topic, tone)
