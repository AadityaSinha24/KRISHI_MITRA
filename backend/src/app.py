
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from utils.ApiError import ApiError

from db.index import connect_db, close_db   

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(lifespan=lifespan)

max_body_size = int(os.getenv("MY_BODY_SIZE", 16384))


# 1) Body-size limit: added first, so it sits INSIDE the CORS middleware
@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > max_body_size:
                return JSONResponse(
                    {"detail": "Request body is too large"}, status_code=413
                )
        except ValueError:
            return JSONResponse(
                {"detail": "Invalid Content-Length header"}, status_code=400
            )
    return await call_next(request)


# 2) CORS: added last, so it's outermost and covers every response (including 413)
origins = [o.strip() for o in os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom AsyncHandler :

@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": exc.success,
            "message": exc.message,
            "data": exc.data,
            "errors": exc.errors
        },
        headers=exc.headers
    )

# Static files
BASE_DIR = Path(__file__).resolve().parent

public_path = BASE_DIR.parent / "public"

public_path.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(public_path)), name="static")


@app.get("/")
def read_root():
    return {"message": "API is running!"}



# Import Routes

from routes import users, prompt

# Routes Declaration

app.include_router(users.router, prefix="/api/v1")
app.include_router(prompt.router, prefix="/api/v1")