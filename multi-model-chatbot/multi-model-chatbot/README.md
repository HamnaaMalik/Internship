# Multi-Model Chatbot CLI

A command-line chatbot that lets you chat with **Gemini**, **Groq (Llama 3.3)**, or
**Hugging Face (Llama 3.1)** — all from a single Python application. Pick a model from
the menu, chat with it, and switch to a different model anytime.

## How to Run

1. Get your free API keys:
   - Gemini: https://aistudio.google.com/app/apikey
   - Groq: https://console.groq.com/keys
   - Hugging Face: https://huggingface.co/settings/tokens (create a token with "read" access)

2. Rename `.env.example` to `.env`

3. Open `.env` and paste your keys:
   ```
   GEMINI_API_KEY=your_gemini_key_here
   GROQ_API_KEY=your_groq_key_here
   HF_API_KEY=your_huggingface_key_here
   ```
   (You only need keys for the model(s) you plan to use — missing keys will just
   show an error for that specific model, not crash the whole app.)

4. Open a terminal in this folder and install dependencies:
   ```
   python -m pip install -r requirements.txt
   ```

5. Run the chatbot:
   ```
   python main.py
   ```

6. Choose a model from the menu (1, 2, or 3), chat with it. Type `back` to return
   to the menu and switch models, or `0` to exit.

## Tech Stack

- Python
- Google Gemini API (`google-genai`)
- Groq API (`groq`)
- Hugging Face Inference API (`huggingface_hub`)
- python-dotenv (for environment variables)
