import os
from typing import Optional

import jwt
from beanie import PydanticObjectId
from fastapi import Request

from models.user import User
from utils.ApiError import ApiError


async def verify_jwt(request: Request) -> User:
    # token from cookie, or from "Authorization: Bearer <token>"
    token: Optional[str] = request.cookies.get("accessToken")
    print(token)

    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header[7:].strip()

    if not token:
        raise ApiError(401, "Unauthorized request")

    secret = os.getenv("ACCESS_TOKEN_SECRET")
    if not secret:
        raise ApiError(500, "Server configuration error")

    try:
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise ApiError(401, "Access token expired")
    except jwt.InvalidTokenError:
        raise ApiError(401, "Invalid access token")

    user_id = decoded.get("_id")
    if not user_id or not PydanticObjectId.is_valid(user_id):
        raise ApiError(401, "Invalid access token")

    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise ApiError(401, "Invalid access token")

    return user  # like req.user