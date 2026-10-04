# from fastapi import APIRouter

# from controllers.users import register_user

# router = APIRouter(prefix="/users", tags=["users"])

# router.add_api_route(
#     "/register", register_user, methods=["POST"], status_code=201
# )

from fastapi import APIRouter

from controllers.users import register_user
from models.user import User
from middlewares.auth import verify_jwt

router = APIRouter(prefix="/users", tags=["users"])

# Public route: no auth
router.add_api_route("/register", register_user, methods=["POST"], status_code=201)

# Protected route: auth happens inside get_me via Depends(verify_jwt)
router.add_api_route("/me",verify_jwt, methods=["GET"], response_model=User)