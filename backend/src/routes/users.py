from fastapi import APIRouter

from controllers.users import register_user

router = APIRouter(prefix="/users", tags=["users"])

router.add_api_route("/register", register_user, methods=["POST"], status_code=201)
# router.add_api_route("/login", login_user, methods=["POST"])