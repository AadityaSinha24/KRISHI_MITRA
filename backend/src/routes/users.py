from fastapi import APIRouter

from controllers.users import register_user, login_user,logout_user,refresh_access_token, get_current_user
from middlewares.auth import verify_jwt

router = APIRouter(prefix="/users", tags=["users"])

router.add_api_route("/register", register_user, methods=["POST"], status_code=201)
router.add_api_route("/login", login_user, methods=["POST"])
router.add_api_route("/logout", logout_user, methods=["POST"])
router.add_api_route("/refresh-token", refresh_access_token, methods=["POST"])
router.add_api_route("/current-user", get_current_user, methods=["GET"])