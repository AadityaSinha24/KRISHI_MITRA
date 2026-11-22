from pydantic import BaseModel
from models.user import User
from prompts import PROMPTS
from utils.ApiError import ApiError
from utils.ApiResponse import api_response
from utils.groq_client import call_qwen
from middlewares.auth import verify_jwt
from fastapi import Depends


class PromptRequest(BaseModel):
    key: str


async def get_prompt_response(
    data: PromptRequest,
    current_user: User = Depends(verify_jwt),
):
    prompt_text = PROMPTS.get(data.key)
    if not prompt_text:
        raise ApiError(400, "Invalid key. Use a number between 1 and 10.")

    result = await call_qwen(prompt_text)

    return api_response(200, {"text": result}, "Prompt fetched successfully")
