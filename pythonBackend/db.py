from motor.motor_asyncio import AsyncIOMotorClient

try:
    from pydantic import BaseSettings
except Exception:
    from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str = "mongodb+srv://mohitsoni2006ms:9829830910@cluster0.xsx2q.mongodb.net"
    mongo_db: str = "GujaratHackathonmainhackathon2026"

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }


settings = Settings()
client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongo_db]
