import os
import asyncio
from groq import Groq
from utils.ApiError import ApiError


def _call_qwen_sync(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ApiError(500, "GROQ_API_KEY is not configured")

    client = Groq(api_key=api_key)

    completion = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_completion_tokens=512,
        top_p=0.80,
        reasoning_effort="none",   # instruct mode — fast, no deep reasoning chain
        stream=False,
        stop=None,
    )
    return completion.choices[0].message.content


async def call_qwen(prompt: str) -> str:
    try:
        # Groq SDK is sync — run in a thread so it doesn't block FastAPI's event loop
        return await asyncio.to_thread(_call_qwen_sync, prompt)
    except ApiError:
        raise
    except Exception as e:
        raise ApiError(502, f"AI service error: {str(e)}")
