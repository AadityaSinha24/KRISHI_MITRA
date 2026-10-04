# import os
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi import Request
# from fastapi.responses import JSONResponse
# from dotenv import load_dotenv
# from fastapi.staticfiles import StaticFiles


# load_dotenv()
# app = FastAPI()


# @app.get("/")
# def read_root():
#     return {"message": "API is running!"}

# origins_env = os.getenv("CORS","http://localhost:5173")

# origins = [origin.strip() for origin in origins_env.split(",")]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,          # Allows specific domains (or ["*"] for all)
#     allow_credentials=True,         # Allows cookies and credentials
#     allow_methods=["*"],            # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
#     allow_headers=["*"],            # Allows all headers
# )


# max_body_size = int(os.getenv("MY_BODY_SIZE",16384))

# @app.middleware("http")
# async def limit_body_size(request: Request, call_next):
#     content_length = request.headers.get("content-length")

#     if content_length and int(content_length) > max_body_size :
#         return JSONResponse({"detail": "Request Body is too large"}, status_code=413)
#     return await call_next(request)

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# public_path = os.path.join(BASE_DIR, "public")

# # Create the directory automatically if it doesn't exist
# os.makedirs(public_path, exist_ok=True)

# app.mount("/static", StaticFiles(directory=public_path), name="static")



import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from db.index import connect_db, close_db   # your connection file (adjust the module name)

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
origins = [o.strip() for o in os.getenv("CORS", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
public_path = os.path.join(BASE_DIR, "public")
os.makedirs(public_path, exist_ok=True)
app.mount("/static", StaticFiles(directory=public_path), name="static")


@app.get("/")
def read_root():
    return {"message": "API is running!"}

# app.include_router(auth.router)   # add your routers here