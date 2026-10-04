# import os
# import jwt
# import bcrypt
# from datetime import datetime, timedelta, timezone
# from typing import List, Optional
# from typing import Annotated, List, Optional
# from beanie import Document, Indexed, Link, Insert, Replace, before_event
# from pydantic import Field, EmailStr, field_validator

# # Optional: If you have a Video model defined in models/video.py
# # from models.video import Video


# class User(Document):
#     # Use Annotated[<type>, Indexed(<options>)] instead of Indexed(<type>, <options>)
#     username: Annotated[str, Indexed(unique=True)]
#     # email: Annotated[EmailStr, Indexed(unique=True)]
#     phone_number = Annotated[str, Indexed(unique=True)]
#     fullname: Annotated[str, Indexed()]
#     # avatar: str  # Cloudinary URL
#     # cover_image: Optional[str] = None
    
    
#     # password: str = Field(..., description="Password is required")
#     refresh_token: Optional[str] = None

#     # Timestamps (equivalent to { timestamps: true })
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

#     class Settings:
#         name = "users"  # MongoDB collection name

#     @field_validator("username", "phone_number", mode="before")
#     @classmethod
#     def lowercase_and_strip(cls, value: str) -> str:
#         if isinstance(value, str):
#             return value.strip().lower()
#         return value

#     @field_validator("fullname", mode="before")
#     @classmethod
#     def strip_whitespace(cls, value: str) -> str:
#         if isinstance(value, str):
#             return value.strip()
#         return value

#     # -------------------------------------------------------------
#     # Lifecycle Hooks (Equivalent to userSchema.pre("save"))
#     # -------------------------------------------------------------
#     @before_event(Insert, Replace)
#     def hash_password(self):
#         """Hashes the password before inserting or replacing if not already hashed."""
#         if self.password and not self.password.startswith("$2b$"):
#             salt = bcrypt.gensalt()
#             self.password = bcrypt.hashpw(self.password.encode("utf-8"), salt).decode("utf-8")
        
#         self.updated_at = datetime.now(timezone.utc)

#     # -------------------------------------------------------------
#     # Instance Methods
#     # -------------------------------------------------------------
#     def is_password_correct(self, password: str) -> bool:
#         """Verifies the plain-text password against the hashed password."""
#         return bcrypt.checkpw(password.encode("utf-8"), self.password.encode("utf-8"))

#     def generate_access_token(self) -> str:
#         """Generates a JWT access token."""
#         # Adjust token expiry according to your needs/env (e.g., 1 day)
#         expiry_seconds = int(os.getenv("ACCESS_TOKEN_EXPIRY_SECONDS", 86400))
#         expiration = datetime.now(timezone.utc) + timedelta(seconds=expiry_seconds)

#         payload = {
#             "_id": str(self.id),
#             "email": self.email,
#             "username": self.username,
#             "fullname": self.fullname,
#             "exp": expiration,
#         }
#         return jwt.encode(
#             payload, 
#             os.getenv("ACCESS_TOKEN_SECRET", "default_secret"), 
#             algorithm="HS256"
#         )

#     def generate_refresh_token(self) -> str:
#         """Generates a JWT refresh token."""
#         expiry_seconds = int(os.getenv("REFRESH_TOKEN_EXPIRY_SECONDS", 864000))
#         expiration = datetime.now(timezone.utc) + timedelta(seconds=expiry_seconds)

#         payload = {
#             "_id": str(self.id),
#             "exp": expiration,
#         }
#         return jwt.encode(
#             payload, 
#             os.getenv("REFRESH_TOKEN_SECRET", "default_secret"), 
#             algorithm="HS256"
#         )


# ****************************************************************************************************

import os
import jwt
import bcrypt
import phonenumbers
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
from beanie import Document, Indexed, Insert, Replace, before_event
from pydantic import Field, EmailStr, field_validator
from pymongo import IndexModel, ASCENDING

# Optional: If you have a Video model defined in models/video.py
# from models.video import Video


class User(Document):
    # Use Annotated[<type>, Indexed(<options>)] instead of Indexed(<type>, <options>)
    # email: Annotated[EmailStr, Indexed(unique=True)]
    email: Optional[EmailStr] = None
    phone_number: Annotated[str, Indexed(unique=True)]
    fullname: Annotated[str, Indexed()] = Field(..., min_length=2, max_length=100)
    # avatar: str  # Cloudinary URL
    # cover_image: Optional[str] = None
    
    
    # password: str = Field(..., description="Password is required")
    refresh_token: Optional[str] = None

    # Timestamps (equivalent to { timestamps: true })
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"  # MongoDB collection name
        indexes = [
            # Unique email, but only enforced for users who actually have one
            IndexModel(
                [("email", ASCENDING)],
                unique=True,
                partialFilterExpression={"email": {"$type": "string"}},
                name="email_unique_partial",
            ),
        ]

    @field_validator("fullname", mode="before")
    @classmethod
    def clean_fullname(cls, value):
        if isinstance(value, str):
            return " ".join(value.split())   # trim + collapse repeated spaces
        return value

    @field_validator("phone_number", mode="before")
    @classmethod
    def normalize_phone(cls, value):
        if not isinstance(value, str):
            raise ValueError("Phone number must be a string")
        region = os.getenv("DEFAULT_PHONE_REGION", "IN")
        try:
            parsed = phonenumbers.parse(value.strip(), region)
        except phonenumbers.NumberParseException:
            raise ValueError("Invalid phone number")
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number")
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, value):
        if isinstance(value, str):
            value = value.strip().lower()
            return value or None   # "" becomes None
        return value

    @before_event(Insert, Replace)
    def hash_password(self):
        """Hashes the password before inserting or replacing if not already hashed."""
        password = getattr(self, "password", None)
        if password and not password.startswith("$2b$"):
            salt = bcrypt.gensalt()
            self.password = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

        self.updated_at = datetime.now(timezone.utc)

    def is_password_correct(self, password: str) -> bool:
        """Verifies the plain-text password against the hashed password."""
        stored = getattr(self, "password", None)
        if not stored:
            return False
        return bcrypt.checkpw(password.encode("utf-8"), stored.encode("utf-8"))

    def generate_access_token(self) -> str:
        """Generates a JWT access token."""
        # Adjust token expiry according to your needs/env (e.g., 1 day)
        expiry_seconds = int(os.getenv("ACCESS_TOKEN_EXPIRY_SECONDS", 86400))
        expiration = datetime.now(timezone.utc) + timedelta(seconds=expiry_seconds)

        payload = {
            "_id": str(self.id),
            "email": self.email,
            "phone_number": self.phone_number,
            "fullname": self.fullname,
            "exp": expiration,
        }
        return jwt.encode(
            payload, 
            os.getenv("ACCESS_TOKEN_SECRET", "default_secret"), 
            algorithm="HS256"
        )

    def generate_refresh_token(self) -> str:
        """Generates a JWT refresh token."""
        expiry_seconds = int(os.getenv("REFRESH_TOKEN_EXPIRY_SECONDS", 864000))
        expiration = datetime.now(timezone.utc) + timedelta(seconds=expiry_seconds)

        payload = {
            "_id": str(self.id),
            "exp": expiration,
        }
        return jwt.encode(
            payload, 
            os.getenv("REFRESH_TOKEN_SECRET", "default_secret"), 
            algorithm="HS256"
        )