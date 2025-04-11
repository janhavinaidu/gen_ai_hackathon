# agents.py
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def run_mistral(prompt):
    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(OLLAMA_URL, json=payload)
    return response.json()['response']
