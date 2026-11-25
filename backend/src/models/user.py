import asyncio
import os
import re
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import bcrypt
import jwt
from beanie import Document, Indexed, Insert, Replace, Save, before_event
from pydantic import Field

_EXPIRY_PATTERN = re.compile(r"^(\d+)([smhdw])$", re.IGNORECASE)
_UNIT_TO_TIMEDELTA = {
    "s": "seconds",
    "m": "minutes",
    "h": "hours",
    "d": "days",
    "w": "weeks",
}


def _hash_sync(password: str) -> str:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError("Password cannot exceed 72 UTF-8 bytes for bcrypt.")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=10)).decode("utf-8")


def parse_expiry(expiry_str: str) -> timedelta:
    """Parses strings like '1d', '15m', '2h', '30s', '1w' into a timedelta."""
    if not expiry_str:
        raise ValueError("Token expiry environment variable cannot be empty.")

    match = _EXPIRY_PATTERN.match(expiry_str.strip())
    if not match:
        raise ValueError(f"Invalid expiry format: '{expiry_str}'. Use e.g. '15m', '1h', '1d', '7d'.")

    value = int(match.group(1))
    unit = match.group(2).lower()
    return timedelta(**{_UNIT_TO_TIMEDELTA[unit]: value})


def _get_required_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {key}")
    return value


class User(Document):
    phoneNumber: Annotated[str, Indexed(unique=True)] = Field(min_length=8, max_length=16)
    fullname: str = Field(min_length=3, max_length=100)
    city: Optional[str] = Field(default=None, min_length=1, max_length=100)
    state: Optional[str] = Field(default=None, min_length=3, max_length=100)
    country: Optional[str] = Field(default=None, min_length=3, max_length=100)
    crop: Optional[str] = Field(default=None, min_length=3, max_length=100)
    language: str = Field(default = "Hindi", min_length=3, max_length=100)
    password: str  # stores the HASH
    refreshToken: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        use_state_management = True

    @before_event(Insert, Replace, Save)
    async def hash_password(self):
        if self.get_saved_state() is None or "password" in self.get_changes():
            # Avoid double-hashing if already a valid 60-char bcrypt hash
            is_already_bcrypt = (
                len(self.password) == 60
                and self.password.startswith(("$2b$", "$2a$", "$2y$"))
            )
            if not is_already_bcrypt:
                self.password = await asyncio.to_thread(_hash_sync, self.password)

        self.updatedAt = datetime.now(timezone.utc)

    async def is_password_correct(self, password: str) -> bool:
        password_bytes = password.encode("utf-8")
        if len(password_bytes) > 72:
            return False
        return await asyncio.to_thread(
            bcrypt.checkpw,
            password_bytes,
            self.password.encode("utf-8"),
        )

    def generate_access_token(self) -> str:
        if self.id is None:
            raise ValueError("Cannot generate access token before saving the user.")

        delta = parse_expiry(os.getenv("ACCESS_TOKEN_EXPIRY", "1d"))
        secret_key = _get_required_env("ACCESS_TOKEN_SECRET")

        payload = {
            "_id": str(self.id),
            "phoneNumber": self.phoneNumber,
            "fullname": self.fullname,
            "city": self.city,
            "state": self.state,
            "crop":self.crop,
            "language":self.language,
            "exp": datetime.now(timezone.utc) + delta,
        }
        return jwt.encode(payload, secret_key, algorithm="HS256")

    def generate_refresh_token(self) -> str:
        if self.id is None:
            raise ValueError("Cannot generate refresh token before saving the user.")

        delta = parse_expiry(os.getenv("REFRESH_TOKEN_EXPIRY", "7d"))
        secret_key = _get_required_env("REFRESH_TOKEN_SECRET")

        payload = {
            "_id": str(self.id),
            "exp": datetime.now(timezone.utc) + delta,
        }
        return jwt.encode(payload, secret_key, algorithm="HS256")