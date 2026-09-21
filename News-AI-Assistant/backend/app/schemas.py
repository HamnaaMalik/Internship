from pydantic import BaseModel, Field


class Article(BaseModel):
    title: str
    url: str
    source: str
    summary: str = ""
    published_at: str | None = None


class Turn(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[Turn] = []
    provider: str | None = None
    model: str | None = None
    topic: str = "world"
    use_live_news: bool = True


class ChatResponse(BaseModel):
    reply: str
    provider: str
    model: str
    sources: list[Article] = []
    fell_back_from: str | None = None


class ProviderInfo(BaseModel):
    id: str
    label: str
    models: list[str]
    default_model: str
    configured: bool
