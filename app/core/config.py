from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "鹦鹉管理系统 API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # 数据库配置
    # 开发环境使用SQLite，生产环境使用MySQL/PostgreSQL
    DATABASE_URL: str = "sqlite:///./parrot_management.db"
    # 如果使用MySQL: mysql+pymysql://username:password@localhost:3306/database_name
    # 如果使用PostgreSQL: postgresql://username:password@localhost:5432/database_name

    # 文件上传配置
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 500 * 1024 * 1024  # 500MB (支持大视频上传)
    ALLOWED_EXTENSIONS: set = {"png", "jpg", "jpeg", "gif", "mp4", "mov", "avi", "mkv", "webm"}

    # CORS配置
    CORS_ORIGINS: list = ["*"]

    # 分页配置
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    class Config:
        env_file = ".env"


settings = Settings()
