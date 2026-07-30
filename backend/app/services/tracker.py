from datetime import date, timedelta
from app.services.opencode_bridge import call_opencode


def get_week_start(dt: date | None = None) -> date:
    d = dt or date.today()
    return d - timedelta(days=d.weekday())


async def generate_weekly_review(metrics: dict, achievements: list, missed: list) -> str:
    prompt = (
        f"Week Metrics:\n{metrics}\n\n"
        f"Achievements:\n{achievements}\n\n"
        f"Missed Opportunities:\n{missed}\n\n"
        f"Generate a brief weekly review with: "
        f"1. Top achievements this week "
        f"2. What to improve "
        f"3. Top 3 priorities for next week "
        f"Be direct and honest."
    )
    return call_opencode(prompt,
        "You are an Engineering Manager conducting a weekly one-on-one review."
    )
