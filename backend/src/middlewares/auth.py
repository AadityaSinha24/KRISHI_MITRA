import os
from typing import Optional

import jwt
from beanie import PydanticObjectId
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from models.user import User

# auto_error=False so we can also fall back to the cookie.
# It also gives you the "Authorize" button in Swagger (/docs).
bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def verify_jwt(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> User:
    # 1) Get the token: cookie first, then the Authorization header
    token = request.cookies.get("accessToken") or (creds.credentials if creds else None)

    if not token:
        raise _unauthorized("Unauthorized request")

    # 2) Verify the token (signature + expiry)
    try:
        decoded = jwt.decode(
            token,
            os.getenv("ACCESS_TOKEN_SECRET", "default_secret"),
            algorithms=["HS256"],
        )
    except jwt.ExpiredSignatureError:
        raise _unauthorized("Access token expired")
    except jwt.InvalidTokenError:
        raise _unauthorized("Invalid access token")

    # 3) Find the user
    user_id = decoded.get("_id")
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise _unauthorized("Invalid access token")

    if not user:
        raise _unauthorized("Invalid access token")

    # 4) Like `req.user = user`, but optional: also keep it on the request
    request.state.user = user
    return user