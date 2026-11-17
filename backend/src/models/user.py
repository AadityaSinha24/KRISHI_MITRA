from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class User(BaseModel):
    phoneNumber: str = Field(
        min_length=8,
        max_length=16
    )

    fullname: str = Field(
        min_length=1,
        max_length=100
    )

    password: str = Field(
        min_length=8
    )


class UserInDB(BaseModel):
    id: Optional[str] = None
    phoneNumber: str
    fullname: str
    password: str
    refreshToken: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None