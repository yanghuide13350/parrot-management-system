# 鹦鹉管理系统后端服务

## 项目概述

这是一个基于FastAPI的鹦鹉养殖和销售管理系统后端服务。

## 技术栈

- **框架**：FastAPI (Python 3.8+)
- **数据库**：SQLite（开发）/ MySQL（生产）
- **ORM**：SQLAlchemy
- **数据验证**：Pydantic
- **数据库迁移**：Alembic
- **文件上传**：本地文件系统（开发）
- **API文档**：Swagger/OpenAPI 自动生成

## 项目结构

```
parrot_management/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── parrots.py          # 鹦鹉管理API
│   │   │   ├── photos.py           # 照片管理API
│   │   │   ├── sales.py            # 销售管理API
│   │   │   └── returns.py          # 退货管理API
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # 配置管理
│   │   └── security.py             # 安全相关
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py                 # 数据库基类
│   │   ├── session.py              # 数据库会话
│   │   └── init_db.py              # 数据库初始化
│   ├── models/
│   │   ├── __init__.py
│   │   ├── parrot.py               # 鹦鹉模型
│   │   ├── photo.py                # 照片模型
│   │   ├── sale.py                 # 销售记录模型
│   │   ├── return_record.py        # 退货记录模型
│   │   └── breed.py                # 品种字典模型
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── parrot.py               # 鹦鹉Schema
│   │   ├── photo.py                # 照片Schema
│   │   ├── sale.py                 # 销售Schema
│   │   ├── return_record.py        # 退货Schema
│   │   └── breed.py                # 品种Schema
│   ├── services/
│   │   ├── __init__.py
│   │   ├── parrot_service.py       # 鹦鹉业务逻辑
│   │   ├── photo_service.py        # 照片业务逻辑
│   │   ├── sale_service.py         # 销售业务逻辑
│   │   └── return_service.py       # 退货业务逻辑
│   └── utils/
│       ├── __init__.py
│       └── file_upload.py          # 文件上传工具
├── alembic/
│   ├── versions/                   # 迁移版本
│   ├── env.py                      # 迁移环境配置
│   └── script.py.mako              # 迁移脚本模板
├── uploads/                        # 上传文件存储目录
├── main.py                         # 应用入口
├── requirements.txt                # Python依赖
└── .env                           # 环境变量配置
```

## 安装和运行

### 环境要求

- Python 3.8+
- pip (Python包管理器)

### 安装步骤

1. 创建虚拟环境：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\\Scripts\\activate  # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 创建数据库表：
```bash
alembic upgrade head
```

4. 运行应用：
```bash
uvicorn main:app --reload
```

5. 访问API文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API接口概览

### 鹦鹉管理
- `POST /api/v1/parrots` - 创建鹦鹉
- `GET /api/v1/parrots` - 获取鹦鹉列表（支持筛选）
- `GET /api/v1/parrots/{parrot_id}` - 获取鹦鹉详情
- `PUT /api/v1/parrots/{parrot_id}` - 更新鹦鹉信息
- `DELETE /api/v1/parrots/{parrot_id}` - 删除鹦鹉
- `PATCH /api/v1/parrots/{parrot_id}/status` - 更新销售状态

### 照片管理
- `POST /api/v1/parrots/{parrot_id}/photos` - 上传照片
- `GET /api/v1/parrots/{parrot_id}/photos` - 获取照片列表
- `DELETE /api/v1/photos/{photo_id}` - 删除照片

### 销售管理
- `POST /api/v1/sales` - 创建销售记录
- `GET /api/v1/sales` - 获取销售记录列表
- `GET /api/v1/sales/{sale_id}` - 获取销售详情

### 退货管理
- `POST /api/v1/returns` - 创建退货记录
- `GET /api/v1/returns` - 获取退货记录列表
- `GET /api/v1/returns/{return_id}` - 获取退货详情

## 许可证

MIT
