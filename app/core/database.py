from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool, QueuePool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# 创建数据库引擎
engine = None
if settings.DATABASE_URL.startswith("sqlite"):
    # 开发环境使用SQLite
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # 生产环境使用MySQL/PostgreSQL
    if settings.DATABASE_URL.startswith("mysql"):
        # MySQL配置
        engine = create_engine(
            settings.DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
        )
    elif settings.DATABASE_URL.startswith("postgresql"):
        # PostgreSQL配置
        engine = create_engine(
            settings.DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
        )
    else:
        # 默认配置
        engine = create_engine(settings.DATABASE_URL)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()


def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库表"""
    Base.metadata.create_all(bind=engine)


def test_connection():
    """测试数据库连接"""
    try:
        with engine.connect() as connection:
            if settings.DATABASE_URL.startswith("sqlite"):
                connection.execute(text("SELECT 1"))
            elif settings.DATABASE_URL.startswith("mysql"):
                connection.execute(text("SELECT 1"))
            elif settings.DATABASE_URL.startswith("postgresql"):
                connection.execute(text("SELECT 1"))
            logger.info("数据库连接测试成功")
            return True
    except Exception as e:
        logger.error(f"数据库连接测试失败: {e}")
        return False
