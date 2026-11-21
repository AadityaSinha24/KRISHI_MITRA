from typing import Optional, Annotated
import os
from pydantic import BaseModel, Field , field_validator
from pymongo.errors import DuplicateKeyError
from pydantic import StringConstraints
from models.user import User
from utils.ApiError import ApiError
from utils.ApiResponse import api_response
from fastapi import Depends
import jwt
from beanie import PydanticObjectId
from fastapi import Request, Response

from middlewares.auth import verify_jwt

Trimmed = Annotated[str, StringConstraints(strip_whitespace=True)]

IS_PROD = os.getenv("ENV", "development") == "production"

COOKIE_OPTIONS = {
    "httponly": True,
    "secure": IS_PROD,
    "samesite": "none" if IS_PROD else "lax",
}

class RegisterRequest(BaseModel):
    phoneNumber: Trimmed = Field(min_length=8, max_length=16)
    fullname: Trimmed = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=72)  # not stripped
    city: Optional[Trimmed] = Field(default=None, min_length=1, max_length=100)
    state: Optional[Trimmed] = Field(default=None, min_length=3, max_length=100)
    country: Optional[Trimmed] = Field(default=None, min_length=3, max_length=100)


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
    password: str = Field(min_length=1, max_length=128)


async def login_user(data: LoginRequest):
    user = await User.find_one(User.phoneNumber == data.phoneNumber)
    if not user:
        raise ApiError(404, "User does not exist")

    if not await user.is_password_correct(data.password):
        raise ApiError(401, "Invalid user credentials")

    access_token, refresh_token = await generate_access_refresh_tokens(user)

    logged_in_user = {
        "id": str(user.id),
        "phoneNumber": user.phoneNumber,
        "fullname": user.fullname,
        "city": user.city,
        "state": user.state,
        "country": user.country,
    }

    res = api_response(
        200,
        {"user": logged_in_user, "accessToken": access_token, "refreshToken": refresh_token},
        "User logged in successfully",
    )
    res.set_cookie("accessToken", access_token, **COOKIE_OPTIONS)
    res.set_cookie("refreshToken", refresh_token, **COOKIE_OPTIONS)
    return res

async def logout_user(current_user: User = Depends(verify_jwt)):
    current_user.refreshToken = None
    await current_user.save()

    res = api_response(200, {}, "User logged out!")
    res.delete_cookie("accessToken", **COOKIE_OPTIONS)
    res.delete_cookie("refreshToken", **COOKIE_OPTIONS)
    return res


class RefreshRequest(BaseModel):
    refreshToken: Optional[str] = None


async def refresh_access_token(
    request: Request,
    data: Optional[RefreshRequest] = None,
):
    # cookie first, then body (same as req.cookies.refreshToken || req.body.refreshToken)
    incoming_refresh_token = request.cookies.get("refreshToken") or (
        data.refreshToken if data else None
    )

    if not incoming_refresh_token:
        raise ApiError(401, "Unauthorized request")

    secret = os.getenv("REFRESH_TOKEN_SECRET")
    if not secret:
        raise ApiError(500, "Server configuration error")

    try:
        decoded = jwt.decode(incoming_refresh_token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise ApiError(401, "Refresh token expired")
    except jwt.InvalidTokenError:
        raise ApiError(401, "Invalid refresh token")

    user_id = decoded.get("_id")
    if not user_id or not PydanticObjectId.is_valid(user_id):
        raise ApiError(401, "Invalid refresh token")

    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise ApiError(401, "Invalid refresh token")

    # token must match the one stored in the DB (rotation: old tokens stop working)
    if incoming_refresh_token != user.refreshToken:
        raise ApiError(401, "Refresh token is expired or used")

    access_token, new_refresh_token = await generate_access_refresh_tokens(user)

    res = api_response(
        200,
        {"accessToken": access_token, "refreshToken": new_refresh_token},
        "Access token refreshed successfully!",
    )
    res.set_cookie("accessToken", access_token, **COOKIE_OPTIONS)
    res.set_cookie("refreshToken", new_refresh_token, **COOKIE_OPTIONS)
    return res

async def get_current_user(current_user: User = Depends(verify_jwt)):
    return api_response(
        200,
        {
            "id": str(current_user.id),
            "phoneNumber": current_user.phoneNumber,
            "fullname": current_user.fullname,
            "city": current_user.city,
            "state": current_user.state,
            "country": current_user.country,
        },
        "Current user fetched successfully",
    )