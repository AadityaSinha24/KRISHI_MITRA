from pydantic import BaseModel, Field

from models.user import User
from utils.api_error import ApiError
from utils.api_response import ApiResponse


class RegisterRequest(BaseModel):
    phoneNumber: str = Field(min_length=8, max_length=16)
    fullname: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=72)  # plain password, validated here

    model_config = {"str_strip_whitespace": True}


async def register_user(data: RegisterRequest):
    # check if user already exists
    existed_user = await User.find_one(User.phoneNumber == data.phoneNumber)
    if existed_user:
        raise ApiError(409, "User with this phone number already exists")

    # create entry in db (password is hashed by the before_event hook)
    user = User(
        phoneNumber=data.phoneNumber,
        fullname=data.fullname,
        password=data.password,
    )
    await user.save()

    # build the response without password and refreshToken
    created_user = {
        "id": str(user.id),
        "phoneNumber": user.phoneNumber,
        "fullname": user.fullname,
        "createdAt": user.createdAt.isoformat(),
    }

    return ApiResponse(201, created_user, "User registered successfully!!")