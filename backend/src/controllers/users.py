from typing import Optional

from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from models.user import User
from utils.ApiError import ApiError
from utils.ApiResponse import api_response


class RegisterRequest(BaseModel):
    phoneNumber: str = Field(min_length=8, max_length=16)
    fullname: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=72)  # plain password, validated here
    city: Optional[str] = Field(default=None, min_length=1, max_length=100)
    state: Optional[str] = Field(default=None, min_length=1, max_length=100)
    country: Optional[str] = Field(default=None, min_length=1, max_length=100)

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