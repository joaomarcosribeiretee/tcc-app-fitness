from pydantic_settings import BaseSettings
from dotenv import load_dotenv


class Settings(BaseSettings):
    load_dotenv()
    MYSQL_HOST: str
    MYSQL_DB: str
    MYSQL_PORT: str
    MYSQL_USER: str
    MYSQL_PASSWORD: str


class SettingsAuth(BaseSettings):
    load_dotenv()
    SECRET_KEY: str
    ALGORITHM: str