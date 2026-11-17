from typing import Generic, TypeVar
from pydantic import BaseModel
from fastapi.responses import JSONResponse

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    status_code: int
    data: T | None = None
    message: str = "Success"
    success: bool = True


def api_response(status_code, data=None, message="Success"):

    response = ApiResponse(
        status_code=status_code,
        data=data,
        message=message,
        success=status_code < 400
    )

    return JSONResponse(
        status_code=status_code,
        content=response.model_dump()
    )