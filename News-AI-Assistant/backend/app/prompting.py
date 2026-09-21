"""Prompt assembly and context-window management.

Two jobs: turn retrieved headlines into a grounded system prompt, and keep the
whole message list under a character budget so long conversations don't blow
past the smallest context window in the provider pool.
"""

from __future__ import annotations

from datetime import date

from .config import CONTEXT_CHAR_BUDGET, MAX_HISTORY_TURNS
from .schemas import Article, Turn

SYSTEM_RULES = """You are Beacon, a news assistant.

Rules you always follow:
- Answer only from the briefing below. If it does not cover the question, say
  so plainly and suggest what the reader could search for instead.
- Cite with bracketed numbers that match the briefing, like [2].
- Separate what a source reported from what is still unconfirmed.
- Never invent a headline, a quote, a number or a date.
- Keep it to three short paragraphs unless the reader asks for more.
Today is {today}."""


def build_briefing(articles: list[Article]) -> str:
    if not articles:
        return "BRIEFING: empty — no live headlines were retrieved for this turn."

    lines = ["BRIEFING — retrieved headlines:"]
    for index, article in enumerate(articles, start=1):
        lines.append(
            f"[{index}] {article.title} ({article.source})"
            f"\n    {article.summary or 'No summary available.'}"
            f"\n    {article.url}"
        )
    return "\n".join(lines)


def trim_history(history: list[Turn], budget: int) -> list[dict]:
    """Keep the most recent turns that fit, oldest dropped first."""
    kept: list[dict] = []
    used = 0
    for turn in reversed(history[-MAX_HISTORY_TURNS * 2 :]):
        cost = len(turn.content) + 16
        if used + cost > budget:
            break
        kept.append({"role": turn.role, "content": turn.content})
        used += cost
    kept.reverse()
    return kept


def build_messages(
    message: str, history: list[Turn], articles: list[Article]
) -> list[dict]:
    system = SYSTEM_RULES.format(today=date.today().isoformat())
    briefing = build_briefing(articles)

    fixed_cost = len(system) + len(briefing) + len(message)
    history_budget = max(0, CONTEXT_CHAR_BUDGET - fixed_cost)

    return [
        {"role": "system", "content": system},
        {"role": "system", "content": briefing},
        *trim_history(history, history_budget),
        {"role": "user", "content": message},
    ]
