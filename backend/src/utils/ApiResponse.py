from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    status_code: int
    data: Optional[T] = None
    message: str = "Success"
    success: bool = True

    def __init__(
        self,
        status_code: int,
        data: Optional[T] = None,
        message: str = "Success",
        **kwargs: Any,
    ):
        super().__init__(
            status_code=status_code,
            data=data,
            message=message,
            success=(status_code < 400),
            **kwargs,
        )
        