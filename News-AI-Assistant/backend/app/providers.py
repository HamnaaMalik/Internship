"""One gateway, four providers.

All four endpoints implement the OpenAI /chat/completions contract, so the
difference between them collapses into base URL + key + model name. This module
exposes two calls: `complete` (single shot) and `stream` (token by token), plus
a fallback chain so a rate-limited provider doesn't break the conversation.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

import httpx

from .config import FALLBACK_ORDER, PROVIDERS, REQUEST_TIMEOUT, Provider


class ProviderError(RuntimeError):
    def __init__(self, provider: str, status: int, detail: str):
        super().__init__(f"{provider} responded {status}: {detail}")
        self.provider = provider
        self.status = status
        self.detail = detail


class NoProviderConfigured(RuntimeError):
    pass


def resolve(provider_id: str | None, model: str | None) -> tuple[Provider, str]:
    """Pick a provider that actually has a key, and a model it can serve."""
    if provider_id:
        provider = PROVIDERS.get(provider_id)
        if provider is None:
            raise NoProviderConfigured(f"Unknown provider '{provider_id}'.")
        if not provider.configured:
            raise NoProviderConfigured(
                f"{provider.label} needs {provider.env_key} in your .env file."
            )
        return provider, model or provider.default_model

    for candidate_id in FALLBACK_ORDER:
        candidate = PROVIDERS[candidate_id]
        if candidate.configured:
            return candidate, candidate.default_model

    raise NoProviderConfigured(
        "No API keys found. Add at least one of GROQ_API_KEY, GOOGLE_API_KEY, "
        "OPENROUTER_API_KEY or HF_TOKEN to your .env file."
    )


def _headers(provider: Provider) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {provider.api_key}",
        "Content-Type": "application/json",
        **provider.extra_headers,
    }


def _payload(model: str, messages: list[dict], stream: bool) -> dict:
    return {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1024,
        "stream": stream,
    }


async def complete(provider: Provider, model: str, messages: list[dict]) -> str:
    url = f"{provider.base_url}/chat/completions"
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(
            url, headers=_headers(provider), json=_payload(model, messages, False)
        )
        if response.status_code >= 400:
            raise ProviderError(provider.id, response.status_code, response.text[:400])
        data = response.json()

    try:
        return data["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError) as exc:  # pragma: no cover - defensive
        raise ProviderError(provider.id, 502, f"Unexpected payload: {data}") from exc


async def stream(
    provider: Provider, model: str, messages: list[dict]
) -> AsyncIterator[str]:
    url = f"{provider.base_url}/chat/completions"
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        async with client.stream(
            "POST", url, headers=_headers(provider), json=_payload(model, messages, True)
        ) as response:
            if response.status_code >= 400:
                body = (await response.aread()).decode(errors="replace")
                raise ProviderError(provider.id, response.status_code, body[:400])

            async for line in response.aiter_lines():
                if not line.startswith("data:"):
                    continue
                chunk = line[5:].strip()
                if not chunk or chunk == "[DONE]":
                    continue
                try:
                    delta = json.loads(chunk)["choices"][0].get("delta", {})
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue
                piece = delta.get("content")
                if piece:
                    yield piece


async def complete_with_fallback(
    messages: list[dict], provider_id: str | None, model: str | None
) -> tuple[str, Provider, str, str | None]:
    """Try the requested provider, then walk the fallback chain.

    Returns (text, provider_used, model_used, provider_we_fell_back_from).
    """
    primary, primary_model = resolve(provider_id, model)
    try:
        text = await complete(primary, primary_model, messages)
        return text, primary, primary_model, None
    except (ProviderError, httpx.HTTPError) as first_error:
        for candidate_id in FALLBACK_ORDER:
            if candidate_id == primary.id:
                continue
            candidate = PROVIDERS[candidate_id]
            if not candidate.configured:
                continue
            try:
                text = await complete(candidate, candidate.default_model, messages)
                return text, candidate, candidate.default_model, primary.label
            except (ProviderError, httpx.HTTPError):
                continue
        raise first_error
