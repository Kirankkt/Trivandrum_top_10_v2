"""Quick test to see which Gemini models are available"""
import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Fix Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

gemini_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=gemini_key)

print("Available Gemini models:")
print("="*50)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✓ {model.name}")

print("="*50)
