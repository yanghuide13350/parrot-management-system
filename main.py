from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import parrots, photos, statistics
from app.core.database import engine, Base
from app.core.exceptions import exception_handler
from app.core.exceptions import ParrotManagementException
import os

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="鹦鹉管理系统API",
    description="鹦鹉养殖和销售管理系统的后端API",
    version="1.0.0"
)

# 注册全局异常处理器
app.add_exception_handler(Exception, exception_handler)


# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# 注册路由
app.include_router(parrots.router, tags=["鹦鹉管理"])
app.include_router(photos.router, tags=["照片管理"])
app.include_router(statistics.router, tags=["统计数据"])

@app.get("/")
def read_root():
    return {
        "message": "欢迎使用鹦鹉管理系统API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
