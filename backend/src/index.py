import os
import sys
import asyncio
from dotenv import load_dotenv
import uvicorn

load_dotenv(dotenv_path="./env")

from db.index import connect_db
from app import app

async def main():
    try:

        await connect_db()
        port = int(os.getenv("PORT",8000))
        print(f"Server is running at port: {port}")

        config = uvicorn.Config("app:app", host="0.0.0.0", port= port , reload=True)
        server = uvicorn.Server(config)
        await server.serve()

    except Exception as error:
        print("Mongo DB connection failed!!!", error)
        sys.exit(1)

if __name__=="__main__":
    asyncio.run(main())



