from beanie.operators import Or
from fastapi import HTTPException, status
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from models.user import User
# from models.user import User, UserRegisterIn


async def register_user(body: User):

    # 1) Validate + normalize by building the model.
    #    The User validators clean the name, convert the phone to E.164
    #    and check the email, so we don't repeat that logic here.
    try:
        user = User(
            fullname=body.fullname,
            phone_number=body.phone_number,
            email=body.email or None
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.errors(include_url=False, include_context=False),
        )

    # 2) Check if the user already exists (phone or email)
    conditions = [User.phone_number == user.phone_number]
    if user.email:
        conditions.append(User.email == user.email)

    existing = await User.find_one(Or(*conditions))
    if existing:
        if existing.phone_number == user.phone_number:
            detail = "User with this phone number already exists"
        else:
            detail = "User with this email already exists"
        raise HTTPException(detail=detail,status_code=status.HTTP_409_CONFLICT)

    # 3) Create the user (the DB unique index is the safety net for races)
    try:
        await user.insert()
    except DuplicateKeyError:
        raise HTTPException(
            detail=f"{user.email} Userss with this phone number or email already exists",
            status_code=status.HTTP_409_CONFLICT,
            # detail="User with this phone number or email already exists",
        )

    # 4) Return the created user without sensitive fields
    return {
        "success": True,
        "message": "User registered successfully!!",
        "data": User(
            id=user.id,
            fullname=user.fullname,
            phone_number=user.phone_number,
            email=user.email,
            created_at=user.created_at,
        ),
    }


