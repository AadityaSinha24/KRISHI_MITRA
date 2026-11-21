from typing import Optional

from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from models.user import User
from utils.ApiError import ApiError
from utils.ApiResponse import api_response


class RegisterRequest(BaseModel):
    phoneNumber: str = Field(min_length=8, max_length=16)
    fullname: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=72)  # plain password, validated here
    city: Optional[str] = Field(default=None, min_length=1, max_length=100)
    state: Optional[str] = Field(default=None, min_length=3, max_length=100)
    country: Optional[str] = Field(default=None, min_length=3, max_length=100)

    model_config = {"str_strip_whitespace": True}


async def register_user(data: RegisterRequest):
    # check if user already exists
    existed_user = await User.find_one(User.phoneNumber == data.phoneNumber)
    if existed_user:
        raise ApiError(409, "User with this phone number already exists")

    user = User(
        phoneNumber=data.phoneNumber,
        fullname=data.fullname,
        password=data.password,  # hashed by the before_event hook
        city=data.city,
        state=data.state,
        country=data.country,
    )

    try:
        await user.save()
    except DuplicateKeyError:
        # two simultaneous requests with the same phone number
        raise ApiError(409, "User with this phone number already exists")

    # response without password and refreshToken
    created_user = {
        "id": str(user.id),
        "phoneNumber": user.phoneNumber,
        "fullname": user.fullname,
        "city": user.city,
        "state": user.state,
        "country": user.country,
        "createdAt": user.createdAt.isoformat(),
    }

    return api_response(201, created_user, "User registered successfully!!")

async def generate_access_refresh_tokens(user: User) -> tuple[str, str]:
    try:
        access_token = user.generate_access_token()
        refresh_token = user.generate_refresh_token()

        user.refreshToken = refresh_token
        await user.save()  # password unchanged, so the hook does not re-hash it

        return access_token, refresh_token
    except Exception:
        raise ApiError(500, "Something went wrong while generating access and refresh token")


class LoginRequest(BaseModel):
    phoneNumber: Trimmed = Field(min_length=8, max_length=16)
    password: str = Field(min_length=1, max_length=128)  # not stripped

async def login_user(data: LoginRequest, response: Response):
    # 1) find user
    user = await User.find_one(User.phoneNumber == data.phoneNumber)
    if not user:
        raise ApiError(404, "User does not exist")

    # 2) check password
    if not await user.is_password_correct(data.password):
        raise ApiError(401, "Invalid user credentials")

    # 3) tokens
    access_token, refresh_token = await generate_access_refresh_tokens(user)

    # 4) cookies (same as your JS options)
    cookie_options = {"httponly": True, "secure": True, "samesite": "none"}
    response.set_cookie("accessToken", access_token, **cookie_options)
    response.set_cookie("refreshToken", refresh_token, **cookie_options)

    # 5) response without password / refreshToken
    logged_in_user = {
        "id": str(user.id),
        "phoneNumber": user.phoneNumber,
        "fullname": user.fullname,
        "city": user.city,
        "state": user.state,
        "country": user.country,
    }

    return api_response(
        200,
        {"user": logged_in_user, "accessToken": access_token, "refreshToken": refresh_token},
        "User logged in successfully",
    )