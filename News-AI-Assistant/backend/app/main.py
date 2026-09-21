from __future__ import annotations

import json
from collections.abc import AsyncIterator

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from . import news, providers
from .config import APP_NAME, PROVIDERS, RSS_FEEDS, available_providers
from .prompting import build_messages
from .schemas import Article, ChatRequest, ChatResponse, ProviderInfo

app = FastAPI(title=APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {
        "status": "ok",
        "providers_ready": [p.id for p in available_providers()],
    }


@app.get("/api/providers", response_model=list[ProviderInfo])
async def list_providers() -> list[ProviderInfo]:
    return [
        ProviderInfo(
            id=p.id,
            label=p.label,
            models=p.models,
            default_model=p.default_model,
            configured=p.configured,
        )
        for p in PROVIDERS.values()
    ]


@app.get("/api/topics")
async def list_topics() -> list[str]:
    return list(RSS_FEEDS.keys())


@app.get("/api/headlines", response_model=list[Article])
async def headlines(
    topic: str = Query("world"),
    q: str | None = Query(None),
    limit: int = Query(8, ge=1, le=20),
) -> list[Article]:
    return await news.fetch_headlines(topic=topic, query=q, limit=limit)


async def _gather_context(request: ChatRequest) -> list[Article]:
    if not request.use_live_news:
        return []
    return await news.fetch_headlines(
        topic=request.topic, query=request.message[:120], limit=8
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    articles = await _gather_context(request)
    messages = build_messages(request.message, request.history, articles)

    try:
        reply, provider, model, fell_back = await providers.complete_with_fallback(
            messages, request.provider, request.model
        )
    except providers.NoProviderConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except providers.ProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=504, detail=f"Could not reach the model provider: {exc}"
        ) from exc

    return ChatResponse(
        reply=reply,
        provider=provider.id,
        model=model,
        sources=articles,
        fell_back_from=fell_back,
    )


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    async def event_source() -> AsyncIterator[str]:
        try:
            articles = await _gather_context(request)
            yield _sse("sources", {"sources": [a.model_dump() for a in articles]})

            provider, model = providers.resolve(request.provider, request.model)
            yield _sse("meta", {"provider": provider.id, "model": model})

            messages = build_messages(request.message, request.history, articles)
            async for token in providers.stream(provider, model, messages):
                yield _sse("token", {"text": token})

            yield _sse("done", {})
        except providers.NoProviderConfigured as exc:
            yield _sse("error", {"message": str(exc)})
        except providers.ProviderError as exc:
            yield _sse(
                "error",
                {"message": f"{exc.provider} refused the request. {exc.detail}"},
            )
        except httpx.HTTPError as exc:
            yield _sse("error", {"message": f"Network error: {exc}"})

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
