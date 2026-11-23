from fastapi import APIRouter
from controllers.prompt import get_prompt_response

router = APIRouter(prefix="/prompt", tags=["prompt"])

router.add_api_route("", get_prompt_response, methods=["POST"])
router.add_api_route("/menu", get_menu, methods=["GET"])