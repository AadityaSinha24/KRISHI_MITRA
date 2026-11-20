import asyncio
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import bcrypt
from beanie import Document, Indexed, before_event, Insert, Replace, Save
from pydantic import Field
import jwt

def _hash_sync(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")


def parse_expiry(expiry_str: str) -> timedelta:
    """Parses environment strings like '1d', '15m', '2h', '30s' into timedelta."""
    if not expiry_str:
        return timedelta(days=1)  # Default fallback
    
    unit = expiry_str[-1].lower()
    try:
        value = int(expiry_str[:-1])
    except ValueError:
        return timedelta(days=1)

    if unit == "s":
        return timedelta(seconds=value)
    elif unit == "m":
        return timedelta(minutes=value)
    elif unit == "h":
        return timedelta(hours=value)
    elif unit == "d":
        return timedelta(days=value)
    elif unit == "w":
        return timedelta(weeks=value)
    
    return timedelta(days=1)

class User(Document):
    phoneNumber: Annotated[str, Indexed(unique=True)] = Field(min_length=8, max_length=16)
    fullname: str = Field(min_length=1, max_length=100)
    city: Optional[str] = Field(default=None, min_length=1, max_length=100)
    state: Optional[str] = Field(default=None, min_length=1, max_length=100)
    country: Optional[str] = Field(default=None, min_length=1, max_length=100)

    password: str  # stores the HASH
    refreshToken: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        use_state_management = True

    # --- EQUIVALENT TO Mongoose pre("save") ---
    @before_event(Insert, Replace, Save)
    async def hash_password(self):
        if self.get_saved_state() is None or "password" in self.get_changes():
            # Extra safety check: only hash if it doesn't already look like a bcrypt hash
            if not self.password.startswith(("$2b$", "$2a$", "$2y$")):
                self.password = await asyncio.to_thread(_hash_sync, self.password)
        self.updatedAt = datetime.now(timezone.utc)

    # --- EQUIVALENT TO Mongoose userSchema.methods.isPasswordCorrect ---
    async def is_password_correct(self, password: str) -> bool:
        return await asyncio.to_thread(
            bcrypt.checkpw,
            password.encode("utf-8"),
            self.password.encode("utf-8"),
        )

    # This is generating the access token using jwt:
    def generate_access_token(self) -> str:
        # Read expiry string from env (e.g., ACCESS_TOKEN_EXPIRY="15m" or "1d")
        expiry_env = os.getenv("ACCESS_TOKEN_EXPIRY", "1d")
        delta = parse_expiry(expiry_env)

        payload = {
            "_id": str(self.id),
            "phoneNumber": self.phoneNumber,
            "fullname": self.fullname,
            "city": self.city,
            "state": self.state,
            "exp": datetime.now(timezone.utc) + delta,
        }

        secret_key = os.getenv("ACCESS_TOKEN_SECRET", "your-access-secret-key")
        return jwt.encode(payload, secret_key, algorithm="HS256")

    
    def generate_refresh_token(self) -> str:
        # Read refresh expiry string from env (e.g., REFRESH_TOKEN_EXPIRY="7d")
        expiry_env = os.getenv("REFRESH_TOKEN_EXPIRY", "7d")
        delta = parse_expiry(expiry_env)

        payload = {
            "_id": str(self.id),
            "exp": datetime.now(timezone.utc) + delta,
        }

        secret_key = os.getenv("REFRESH_TOKEN_SECRET", "your-refresh-secret-key")
        return jwt.encode(payload, secret_key, algorithm="HS256")