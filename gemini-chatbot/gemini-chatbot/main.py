"""
Gemini Chatbot CLI
A simple command-line chatbot powered by Google's Gemini API.
"""

import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Load API key from .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("ERROR: GEMINI_API_KEY not found.")
    print("Create a .env file (see .env.example) and add your API key.")
    sys.exit(1)

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-3.6-flash")


def main():
    print("=" * 50)
    print("  Gemini Chatbot CLI")
    print("  Type 'exit' or 'quit' to end the conversation.")
    print("=" * 50)

    # Keeps conversation history so the bot remembers context
    chat = model.start_chat(history=[])

    while True:
        user_input = input("\nYou: ").strip()

        if user_input.lower() in ("exit", "quit"):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        try:
            response = chat.send_message(user_input)
            print(f"\nGemini: {response.text}")
        except Exception as e:
            print(f"\n[Error talking to Gemini API]: {e}")


if __name__ == "__main__":
    main()
