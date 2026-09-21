"""Runtime settings and the multi-provider LLM registry.

Every provider here speaks the OpenAI chat-completions wire format, so the
gateway in providers.py can talk to all four through one code path. The only
things that differ are the base URL, the auth header and the default model.
"""

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Provider:
    id: str
    label: str
    base_url: str
    env_key: str
    default_model: str
    models: list[str] = field(default_factory=list)
    # Some gateways want extra headers (OpenRouter uses them for attribution).
    extra_headers: dict[str, str] = field(default_factory=dict)

    @property
    def api_key(self) -> str | None:
        return os.getenv(self.env_key)

    @property
    def configured(self) -> bool:
        return bool(self.api_key)


APP_NAME = "Beacon — News AI Assistant"
APP_URL = os.getenv("APP_PUBLIC_URL", "http://localhost:5173")

PROVIDERS: dict[str, Provider] = {
    "groq": Provider(
        id="groq",
        label="GROQ",
        base_url="https://api.groq.com/openai/v1",
        env_key="GROQ_API_KEY",
        default_model="openai/gpt-oss-120b",
        models=[
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3-32b",
        ],
    
    ),
    "google": Provider(
        id="google",
        label="Google AI Studio",
        base_url="https://generativelanguage.googleapis.com/v1beta/openai",
        env_key="GOOGLE_API_KEY",
        default_model="gemini-2.0-flash",
        models=["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"],
    ),
    "openrouter": Provider(
        id="openrouter",
        label="OpenRouter",
        base_url="https://openrouter.ai/api/v1",
        env_key="OPENROUTER_API_KEY",
        default_model="meta-llama/llama-3.3-70b-instruct",
        models=[
            "meta-llama/llama-3.3-70b-instruct",
            "mistralai/mistral-small-3.1-24b-instruct",
            "qwen/qwen-2.5-72b-instruct",
        ],
        extra_headers={"HTTP-Referer": APP_URL, "X-Title": APP_NAME},
    ),
    "huggingface": Provider(
        id="huggingface",
        label="Hugging Face Hub",
        base_url="https://router.huggingface.co/v1",
        env_key="HF_TOKEN",
        default_model="meta-llama/Llama-3.1-8B-Instruct",
        models=[
            "meta-llama/Llama-3.1-8B-Instruct",
            "Qwen/Qwen2.5-7B-Instruct",
        ],
    ),
}

# Order the gateway falls back through when a provider errors or rate-limits.
FALLBACK_ORDER = ["groq", "google", "openrouter", "huggingface"]

# News sources
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
RSS_FEEDS = {
    "world": [
        "https://feeds.bbci.co.uk/news/world/rss.xml",
        "https://www.aljazeera.com/xml/rss/all.xml",
    ],
    "technology": [
        "https://feeds.arstechnica.com/arstechnica/technology-lab",
        "https://www.theverge.com/rss/index.xml",
    ],
    "business": ["https://feeds.bbci.co.uk/news/business/rss.xml"],
    "science": ["https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"],
    "sports": ["https://feeds.bbci.co.uk/sport/rss.xml"],
    "pakistan": ["https://www.dawn.com/feeds/home"],
}

# Context-window budget, in characters (roughly 4 chars ≈ 1 token).
CONTEXT_CHAR_BUDGET = int(os.getenv("CONTEXT_CHAR_BUDGET", "12000"))
MAX_HISTORY_TURNS = int(os.getenv("MAX_HISTORY_TURNS", "8"))
REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "60"))


def available_providers() -> list[Provider]:
    return [p for p in PROVIDERS.values() if p.configured]
