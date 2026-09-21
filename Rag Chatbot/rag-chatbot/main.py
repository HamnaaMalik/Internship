"""
Simple RAG Chatbot (FastAPI + Supabase/PostgreSQL + Gemini)

Endpoints:
  POST /ingest  -> add a document's text into the knowledge base
  POST /chat    -> ask a question, get an answer grounded in your documents
  GET  /health  -> check the server and DB connection are working
"""

import os
from contextlib import asynccontextmanager

import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set. Check your .env file.")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set. Check your .env file.")

client = genai.Client(api_key=GEMINI_API_KEY)


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def embed_text(text: str):
    """Turn text into a vector using Gemini's embedding model."""
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config={"output_dimensionality": 768},
    )

    return result.embeddings[0].values


def chunk_text(text: str, chunk_size: int = 500):
    """Split a long text into smaller chunks."""
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])

        if chunk.strip():
            chunks.append(chunk)

    return chunks


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        conn = get_connection()
        conn.close()
        print("Connected to database successfully.")
    except Exception as e:
        print(f"WARNING: could not connect to database on startup: {e}")

    yield


app = FastAPI(
    title="Simple RAG Chatbot",
    lifespan=lifespan
)


class IngestRequest(BaseModel):
    text: str
    source: str = "unknown"


class ChatRequest(BaseModel):
    question: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ingest")
def ingest(req: IngestRequest):
    """Add a document to the knowledge base."""

    chunks = chunk_text(req.text)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="No text provided."
        )

    try:
        conn = get_connection()
        cur = conn.cursor()

        try:
            for chunk in chunks:

                embedding = embed_text(chunk)

                cur.execute(
                    """
                    INSERT INTO public.documents
                    (content, source, embedding)
                    VALUES (%s, %s, %s::vector)
                    """,
                    (
                        chunk,
                        req.source,
                        embedding
                    )
                )

            conn.commit()

        finally:
            cur.close()
            conn.close()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {str(e)}"
        )

    return {
        "message": f"Ingested {len(chunks)} chunk(s) from '{req.source}'."
    }


@app.post("/chat")
def chat(req: ChatRequest):
    """Answer a question using the most relevant document chunks."""

    try:
        # Create embedding for the question
        question_embedding = embed_text(req.question)

        # Connect to database
        conn = get_connection()
        cur = conn.cursor()

        try:
            # Direct vector similarity search
            cur.execute(
                """
                SELECT
                    content,
                    source,
                    1 - (embedding <=> %s::vector) AS similarity
                FROM public.documents
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> %s::vector
                LIMIT 4
                """,
                (
                    question_embedding,
                    question_embedding
                )
            )

            rows = cur.fetchall()

            # Keep chat useful if a database vector search returns no rows.
            if not rows:
                cur.execute(
                    """
                    SELECT content, source, 0.0 AS similarity
                    FROM public.documents
                    WHERE content IS NOT NULL AND content <> ''
                    ORDER BY id DESC
                    LIMIT 4
                    """
                )
                rows = cur.fetchall()

        finally:
            cur.close()
            conn.close()

        # Print this in Terminal so we can see what the app retrieved
        print("CHAT ROWS:", len(rows))
        print("CHAT DATA:", rows)

        # If nothing was retrieved
        if not rows:
            return {
                "answer": "No documents were retrieved from the database.",
                "sources": []
            }

        # Prepare context
        context = "\n\n".join(
            row[0] for row in rows
        )

        sources = list(
            set(row[1] for row in rows)
        )

        # Prompt for Gemini
        prompt = f"""
Answer the question using ONLY the context below.

If the answer is not present in the context,
say that you don't have enough information.

Context:
{context}

Question:
{req.question}

Answer:
"""

        # Generate answer
        # Generate answer
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        

        return {
            "answer": response.text,
            "sources": sources
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {str(e)}"
        )