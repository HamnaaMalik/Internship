"""
Multi-Model Chatbot CLI
A command-line chatbot that lets you chat with Gemini, Groq, or Hugging Face models,
all from one program.
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_API_KEY = os.getenv("HF_API_KEY")


def chat_with_gemini():
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY not found in .env file.")
        return

    from google import genai

    client = genai.Client(api_key=GEMINI_API_KEY)
    chat = client.chats.create(model="gemini-3.6-flash")
    

    print("\nConnected to Gemini. Type 'back' to return to the menu.\n")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == "back":
            break
        if not user_input:
            continue
        try:
            response = chat.send_message(user_input)
            print(f"\nGemini: {response.text}\n")
        except Exception as e:
            print(f"\n[Gemini Error]: {e}\n")


def chat_with_groq():
    if not GROQ_API_KEY:
        print("ERROR: GROQ_API_KEY not found in .env file.")
        return

    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)
    history = [{"role": "system", "content": "You are a helpful assistant."}]

    print("\nConnected to Groq (Llama 3.3 70B). Type 'back' to return to the menu.\n")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == "back":
            break
        if not user_input:
            continue

        history.append({"role": "user", "content": user_input})
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=history,
            )
            reply = response.choices[0].message.content
            history.append({"role": "assistant", "content": reply})
            print(f"\nGroq: {reply}\n")
        except Exception as e:
            print(f"\n[Groq Error]: {e}\n")


def chat_with_huggingface():
    if not HF_API_KEY:
        print("ERROR: HF_API_KEY not found in .env file.")
        return

    from huggingface_hub import InferenceClient

    client = InferenceClient(api_key=HF_API_KEY)
    history = [{"role": "system", "content": "You are a helpful assistant."}]

    print("\nConnected to Hugging Face (Llama 3.1 8B). Type 'back' to return to the menu.\n")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == "back":
            break
        if not user_input:
            continue

        history.append({"role": "user", "content": user_input})
        try:
            response = client.chat.completions.create(
                model="meta-llama/Llama-3.1-8B-Instruct",
                messages=history,
            )
            reply = response.choices[0].message.content
            history.append({"role": "assistant", "content": reply})
            print(f"\nHugging Face: {reply}\n")
        except Exception as e:
            print(f"\n[Hugging Face Error]: {e}\n")


def main():
    while True:
        print("=" * 55)
        print("  Multi-Model Chatbot CLI")
        print("=" * 55)
        print("Choose a model to chat with:")
        print("  1. Gemini")
        print("  2. Groq (Llama 3.3)")
        print("  3. Hugging Face (Llama 3.1)")
        print("  0. Exit")

        choice = input("\nEnter your choice: ").strip()

        if choice == "1":
            chat_with_gemini()
        elif choice == "2":
            chat_with_groq()
        elif choice == "3":
            chat_with_huggingface()
        elif choice == "0":
            print("\nGoodbye!")
            sys.exit(0)
        else:
            print("\nInvalid choice, please try again.\n")


if __name__ == "__main__":
    main()
