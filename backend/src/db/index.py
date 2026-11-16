# import os
# import sys
# from motor.motor_asyncio import AsyncIOMotorClient
# from pymongo import AsyncMongoClient
# from beanie import init_beanie
# from constants import DB_NAME
# from models.user import User

# async def connect_db():
#     try:
#         client = AsyncMongoClient(os.getenv("MONGODB_URI"))
#         database = client[DB_NAME] 
#         await init_beanie(
#             database=database,
#             document_models=[
#                 # Add user model here
#                 User
#             ]

#         )

#         host = client.address[0] if client.address else "unknown"
#         print(f"\n MongoDB connected !! DB HOST : {host}")

#     except Exception as error:
#         print("MongoDB connection error",error)
#         sys.exit(1)


# import os
# import sys
# from dotenv import load_dotenv
# from pymongo import AsyncMongoClient
# from beanie import init_beanie
# from constants import DB_NAME
# from models.user import User

# load_dotenv()

# client = None

# async def connect_db():
#     global client
#     try:
#         uri = os.getenv("MONGODB_URI")
#         if not uri:
#             raise ValueError("MONGODB_URI is not set")

#         client = AsyncMongoClient(uri)
#         await client.admin.command("ping")   # verifies the connection

#         await init_beanie(
#             database=client[DB_NAME],
#             document_models=[User],
#         )
#         print(f"\nMongoDB connected !! DB: {DB_NAME}")

#     except Exception as error:
#         print("MongoDB connection error:", error)
#         sys.exit(1)

# async def close_db():
#     if client:
#         await client.close()


import os
from dotenv import load_dotenv
from pymongo import AsyncMongoClient
from beanie import init_beanie
from constants import DB_NAME
from models.user import User

load_dotenv()

client = None

async def connect_db():
    global client

    try:
        uri = os.getenv("MONGODB_URI")

        if not uri:
            raise ValueError("MONGODB_URI is not set")

        if not DB_NAME:
            raise ValueError("DB_NAME is not configured")

        client = AsyncMongoClient(uri)

        await client.admin.command("ping")

        await init_beanie(
            database=client[DB_NAME],
            document_models=[User],
        )

        print(f"MongoDB connected! DB: {DB_NAME}")

    except Exception as error:
        print("MongoDB connection error:", error)

        if client is not None:
            await client.close()
            client = None

        raise


async def close_db():
    global client

    if client is not None:
        await client.close()
        client = None
