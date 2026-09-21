"""Headline retrieval.

Tries NewsAPI when a key is present, otherwise falls back to public RSS feeds
so the app is useful with zero news credentials. Results are cached for a few
minutes because headlines don't change every second and every request otherwise
burns quota.
"""

from __future__ import annotations

import html
import re
import time
from xml.etree import ElementTree

import httpx

from .config import NEWSAPI_KEY, REQUEST_TIMEOUT, RSS_FEEDS
from .schemas import Article

_CACHE: dict[str, tuple[float, list[Article]]] = {}
_CACHE_TTL = 300  # seconds
_TAG_RE = re.compile(r"<[^>]+>")


def _clean(text: str | None, limit: int = 320) -> str:
    if not text:
        return ""
    stripped = html.unescape(_TAG_RE.sub(" ", text))
    collapsed = " ".join(stripped.split())
    return collapsed[:limit]


async def _from_newsapi(topic: str, query: str | None, limit: int) -> list[Article]:
    params: dict[str, str | int] = {"pageSize": limit, "language": "en"}
    if query:
        url = "https://newsapi.org/v2/everything"
        params |= {"q": query, "sortBy": "publishedAt"}
    else:
        url = "https://newsapi.org/v2/top-headlines"
        params |= {"category": topic if topic != "world" else "general"}

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.get(
            url, params=params, headers={"X-Api-Key": NEWSAPI_KEY or ""}
        )
        response.raise_for_status()
        payload = response.json()

    return [
        Article(
            title=_clean(item.get("title"), 200),
            url=item.get("url", ""),
            source=(item.get("source") or {}).get("name", "NewsAPI"),
            summary=_clean(item.get("description")),
            published_at=item.get("publishedAt"),
        )
        for item in payload.get("articles", [])
        if item.get("title") and item.get("url")
    ]


async def _from_rss(topic: str, limit: int) -> list[Article]:
    feeds = RSS_FEEDS.get(topic) or RSS_FEEDS["world"]
    articles: list[Article] = []

    async with httpx.AsyncClient(
        timeout=REQUEST_TIMEOUT, follow_redirects=True
    ) as client:
        for feed_url in feeds:
            try:
                response = await client.get(feed_url)
                response.raise_for_status()
                root = ElementTree.fromstring(response.content)
            except (httpx.HTTPError, ElementTree.ParseError):
                continue

            channel_title = root.findtext("./channel/title") or "RSS"
            items = root.findall("./channel/item") or root.findall(
                "{http://www.w3.org/2005/Atom}entry"
            )
            for item in items:
                title = item.findtext("title") or item.findtext(
                    "{http://www.w3.org/2005/Atom}title"
                )
                link_el = item.find("{http://www.w3.org/2005/Atom}link")
                link = item.findtext("link") or (
                    link_el.get("href") if link_el is not None else None
                )
                if not title or not link:
                    continue
                articles.append(
                    Article(
                        title=_clean(title, 200),
                        url=link.strip(),
                        source=_clean(channel_title, 60),
                        summary=_clean(
                            item.findtext("description")
                            or item.findtext("{http://www.w3.org/2005/Atom}summary")
                        ),
                        published_at=item.findtext("pubDate")
                        or item.findtext("{http://www.w3.org/2005/Atom}updated"),
                    )
                )

    return articles[:limit]


async def fetch_headlines(
    topic: str = "world", query: str | None = None, limit: int = 8
) -> list[Article]:
    key = f"{topic}|{query or ''}|{limit}"
    cached = _CACHE.get(key)
    if cached and time.time() - cached[0] < _CACHE_TTL:
        return cached[1]

    articles: list[Article] = []
    if NEWSAPI_KEY:
        try:
            articles = await _from_newsapi(topic, query, limit)
        except httpx.HTTPError:
            articles = []
    if not articles:
        articles = await _from_rss(topic, limit)

    if articles:
        _CACHE[key] = (time.time(), articles)
    return articles
