# Beacon — News AI Assistant

A full-stack news assistant. It pulls live headlines, grounds a language model
in them, and answers questions with numbered citations back to the original
articles. Four model providers sit behind one gateway, so if Groq rate-limits
you mid-conversation the answer still arrives from Gemini or OpenRouter.

**Stack:** Python, FastAPI, React.js (Vite), GROQ, Google AI Studio,
OpenRouter, Hugging Face Hub.

---

## What it does

- **Retrieval first.** Headlines come from NewsAPI when a key is present, and
  from public RSS feeds otherwise, so the app runs with zero news credentials.
- **Grounded answers.** The model is told to answer only from the retrieved
  briefing and to cite with `[2]`-style markers. The UI turns those markers
  into links to the real article.
- **One gateway, four providers.** All four speak the OpenAI chat-completions
  format, so `providers.py` handles them through a single code path — only the
  base URL, key and model name change.
- **Automatic failover.** `complete_with_fallback` walks `groq → google →
  openrouter → huggingface`, skipping providers with no key, and the response
  reports which provider actually served it.
- **Token streaming.** Answers arrive word by word over Server-Sent Events,
  with source metadata pushed before the first token.
- **Context-window management.** `prompting.py` measures the system prompt,
  briefing and question, then spends whatever budget is left on recent history,
  dropping the oldest turns first.

---

## Architecture

```
React (Vite, :5173)
   │  POST /api/chat/stream          ← SSE: sources → meta → tokens → done
   ▼
FastAPI (:8000)
   ├── news.py        NewsAPI → RSS fallback, 5-minute cache
   ├── prompting.py   briefing + history trimming against a char budget
   └── providers.py   one OpenAI-compatible client, four base URLs
                      GROQ · Google AI Studio · OpenRouter · Hugging Face
```

---

## Setup

### 1. Keys

```bash
cp .env.example .env
```

Add **at least one** model key (`GROQ_API_KEY`, `GOOGLE_API_KEY`,
`OPENROUTER_API_KEY` or `HF_TOKEN`). `NEWSAPI_KEY` is optional.

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://127.0.0.1:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to port 8000, so there is
nothing else to configure.

---

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service status and which providers have keys |
| GET | `/api/providers` | Provider list with models and configured flag |
| GET | `/api/topics` | Available topic slugs |
| GET | `/api/headlines?topic=&q=&limit=` | Retrieved articles |
| POST | `/api/chat` | Single-shot answer with fallback |
| POST | `/api/chat/stream` | Same, streamed as SSE |

Example:

```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What happened in tech today?","topic":"technology"}'
```

---

## Design notes

The interface is split into a **wire** (left: live headlines, topic chips,
one-tap questions) and a **reading column** (right: the conversation). Answers
are set in Newsreader at 18px because people read them like an article, while
controls stay in Inter so chrome never competes with content. Citation chips
are the only saturated element in the answer body — everything else is quiet on
purpose.

---

## Learning outcomes

- Prompt engineering for grounded, citation-bearing answers
- Full-duplex REST communication with models over SSE streaming
- Context-window management under a fixed token budget
- Cross-provider LLM API integration behind a single gateway abstraction
- Retrieval fallback design (paid API → free RSS) and response caching

---

## Possible next steps

- Persist conversations in SQLite
- Vector search over article bodies instead of headline-only retrieval
- A daily digest job that writes Markdown summaries to disk
- Docker Compose for one-command startup
