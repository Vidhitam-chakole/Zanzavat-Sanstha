import json
import os

import requests


def handler(request, response):
    if request.method != "POST":
        return response.json({"status": "error", "message": "Method not allowed."}, status=405)

    try:
        body = request.body.decode("utf-8") if request.body else "{}"
        data = json.loads(body or "{}")
    except Exception:
        return response.json({"status": "error", "message": "Invalid JSON payload."}, status=400)

    message = str(data.get("message", "")).strip()
    ai_key = os.getenv("GROQ_API_KEY") or os.getenv("NGROK_API_KEY")

    if not message:
        return response.json({"status": "error", "message": "Please enter a message."}, status=400)

    if not ai_key:
        return response.json({"status": "error", "message": "AI assistant is not configured yet."}, status=503)

    try:
        api_url = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
        result = requests.post(
            api_url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {ai_key}",
            },
            json={
                "model": os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
                "messages": [{"role": "user", "content": message}],
            },
            timeout=45,
        )
        result.raise_for_status()
        payload = result.json()
        reply = payload.get("choices", [{}])[0].get("message", {}).get("content")
        reply = reply or payload.get("reply") or payload.get("response")

        if not reply:
            return response.json({"status": "error", "message": "The AI returned an empty response."}, status=502)

        return response.json({"status": "success", "reply": reply}, status=200)
    except Exception:
        return response.json({"status": "error", "message": "The assistant is unavailable right now."}, status=502)
