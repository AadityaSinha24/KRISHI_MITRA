from fastapi import HTTPException
from typing import List, Any, Optional


class ApiError(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str = "Something went wrong",
        errors: Optional[List[Any]] = None,
        headers: Optional[dict] = None,
    ):
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.status_code = status_code
        self.message = message
        self.data = None
        self.success = False
        self.errors = errors or []