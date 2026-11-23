import logging
import os

from groq import AsyncGroq

from utils.ApiError import ApiError

logger = logging.getLogger(__name__)
_client = None


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.error("GROQ_API_KEY is not configured")
            raise ApiError(500, "AI service is not configured")
        _client = AsyncGroq(api_key=api_key)
    return _client


async def call_qwen(prompt: str) -> str:
    try:
        completion = await _get_client().chat.completions.create(
            model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_completion_tokens=512,
            top_p=0.8,
            reasoning_effort="none",
            stream=False,
        )
        text = completion.choices[0].message.content
        if not text:
            raise ApiError(502, "AI service returned an empty response")
        return text
    except ApiError:
        raise
    except Exception:
        logger.exception("Groq call failed")
        raise ApiError(502, "AI service is unavailable, please try again")