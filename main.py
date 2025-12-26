from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import parrots, photos, statistics, incubation, sales
from app.core.database import engine, Base
from app.core.exceptions import exception_handler
from app.core.exceptions import ParrotManagementException
import os

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="鹦鹉管理系统API",
    description="""
    ## 鹦鹉养殖和销售管理系统的后端API
    
    ### 核心功能
    - **鹦鹉管理**：创建、查询、更新、删除鹦鹉信息
    - **照片管理**：上传和管理鹦鹉照片/视频
    - **配对管理**：配对种鸟、取消配对、查询可配对对象
    - **销售管理**：记录销售信息、查询销售记录、销售统计
    - **退货管理**：处理退货、查询退货历史
    - **回访管理**：创建和查询回访记录
    - **统计分析**：销售统计、退货统计、月度趋势
    
    ### 数据库设计
    - **Parrot表**：存储鹦鹉基本信息和当前销售状态
    - **SalesHistory表**：存储所有历史销售记录（包括退货）
    - **Photo表**：存储鹦鹉照片和视频
    - **FollowUp表**：存储客户回访记录
    
    ### API 版本
    当前版本：v1.0.0
    """,
    version="1.0.0",
    contact={
        "name": "鹦鹉管理系统",
        "url": "https://github.com/your-repo/parrot-management-system",
    },
    license_info={
        "name": "MIT",
    },
)

# 注册全局异常处理器
app.add_exception_handler(Exception, exception_handler)


# CORS配置
# 从环境变量获取允许的域名，生产环境需要设置 ALLOWED_ORIGINS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
app.include_router(incubation.router, tags=["孵化管理"])
app.include_router(sales.router, tags=["销售管理"])

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
