# Simple RAG Chatbot

--database pswd :H@mnaM@lik212--

A Retrieval-Augmented Generation (RAG) chatbot API built with **FastAPI**,
**PostgreSQL (hosted on Supabase)**, and **Gemini**. It answers questions using
only the documents you give it, instead of making things up.

How it works: you "ingest" (add) some text → the app breaks it into chunks and
stores each chunk's meaning as a vector (embedding) in the database → when you
ask a question, it finds the most relevant chunks and asks Gemini to answer
using only that context.

## Part 1: Set Up Supabase (free, cloud database, no install needed)

1. Go to https://supabase.com and sign up (free)
2. Click **"New Project"**, give it a name, set a database password (save it
   somewhere safe, you'll need it), and create the project
3. Once it's ready, go to the **SQL Editor** (left sidebar)
4. Open the `schema.sql` file from this project, copy all of it, paste it into
   the SQL Editor, and click **Run** — this creates the `documents` table and
   enables vector search
5. Go to **Project Settings → Database** (left sidebar, gear icon)
6. Find the **Connection string** section, choose the **URI** tab, and copy it
   — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with the database password you set in step 2

## Part 2: Set Up the Project Locally

1. Rename `.env.example` to `.env`
2. Paste your values into `.env`:
   ```
   GEMINI_API_KEY=your_gemini_key_here
   DATABASE_URL=your_supabase_connection_string_from_above
   ```
3. Open a terminal in this folder and install dependencies:
   ```
   python -m pip install -r requirements.txt
   ```
4. Run the server:
   ```
   uvicorn main:app --reload
   ```
5. You should see `Connected to database successfully.` in the terminal

## Part 3: Try It Out

FastAPI gives you an interactive test page automatically. Open this in your
browser:
```
http://127.0.0.1:8000/docs
```

**Step A — Add a document (POST /ingest):**
Click on `/ingest` → "Try it out" → paste this, then click Execute:
```json
{
  "text": "Hamna Malik is a Full Stack AI Engineer who works with Falcon Swift and builds projects using Python, FastAPI, and PostgreSQL.",
  "source": "about_me.txt"
}
```
(There's also a ready-made `sample_docs/about_me.txt` file you can copy text from.)

**Step B — Ask a question (POST /chat):**
Click on `/chat` → "Try it out" → paste this, then click Execute:
```json
{
  "question": "What technologies does Hamna work with?"
}
```
You'll get an answer generated from the document you added, plus which
source(s) it used.

You can also test this in **Postman**: create a POST request to
`http://127.0.0.1:8000/chat` with a JSON body like above.

## Tech Stack

- FastAPI (Python web framework)
- PostgreSQL + pgvector (hosted on Supabase) for storing and searching embeddings
- Google Gemini API for embeddings and generating answers
- Postman / FastAPI's built-in `/docs` page for testing
