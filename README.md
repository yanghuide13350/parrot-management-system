# 鹦鹉管理系统

## 项目概述

这是一个完整的鹦鹉养殖和销售管理系统，包含后端服务（FastAPI）和前端应用（React + TypeScript）。系统支持鹦鹉信息管理、配对管理、销售记录、退货管理、回访跟踪和数据统计分析等功能。

## 核心功能

- **鹦鹉管理**：录入、查询、更新、删除鹦鹉信息，支持照片/视频上传
- **配对管理**：配对种鸟、取消配对、查询可配对对象
- **销售管理**：记录销售信息、查询销售记录、销售统计分析
- **退货管理**：处理退货、查询退货历史、退货率统计
- **回访管理**：创建回访记录、跟踪回访状态
- **数据统计**：销售统计、退货统计、月度销售趋势
- **销售时间线**：完整的鹦鹉销售历史追踪

## 技术栈

### 后端

- **框架**：FastAPI (Python 3.8+)
- **数据库**：SQLite（开发）/ MySQL（生产）
- **ORM**：SQLAlchemy
- **数据验证**：Pydantic
- **数据库迁移**：Alembic

### 前端

- **框架**：React 18 + TypeScript
- **UI 库**：Ant Design
- **状态管理**：React Hooks
- **路由**：React Router
- **构建工具**：Vite

## 项目结构

```
parrot-management-system/
├── app/                            # 后端应用
│   ├── api/                        # API路由
│   │   ├── parrots.py             # 鹦鹉管理API
│   │   ├── sales.py               # 销售管理API
│   │   └── statistics.py          # 统计分析API
│   ├── core/                       # 核心模块
│   │   ├── config.py              # 配置管理
│   │   ├── database.py            # 数据库连接
│   │   └── exceptions.py          # 异常处理
│   ├── models/                     # 数据模型
│   │   ├── parrot.py              # 鹦鹉模型
│   │   ├── photo.py               # 照片模型
│   │   ├── sales_history.py       # 销售历史模型
│   │   ├── follow_up.py           # 回访记录模型
│   │   └── incubation_record.py   # 孵化记录模型
│   ├── schemas/                    # Pydantic模式
│   │   └── parrot.py              # 鹦鹉Schema
│   └── utils/                      # 工具函数
│       └── file_upload.py         # 文件上传工具
├── parrot-management-system/       # 前端应用
│   ├── src/
│   │   ├── components/            # React组件
│   │   ├── pages/                 # 页面组件
│   │   │   ├── dashboard/         # 仪表盘
│   │   │   ├── parrots/           # 鹦鹉管理
│   │   │   ├── breeding/          # 配对管理
│   │   │   ├── sales/             # 销售管理
│   │   │   └── incubation/        # 孵化管理
│   │   ├── services/              # API服务
│   │   ├── types/                 # TypeScript类型
│   │   └── App.tsx                # 应用入口
│   ├── public/                    # 静态资源
│   └── package.json               # 前端依赖
├── alembic/                        # 数据库迁移
│   └── versions/                  # 迁移版本
├── uploads/                        # 上传文件存储
├── main.py                         # 后端入口
├── requirements.txt                # Python依赖
└── .env                           # 环境变量配置
```

## 安装和运行

### 环境要求

- Python 3.8+
- Node.js 16+
- pip (Python 包管理器)
- npm 或 yarn

### 后端安装步骤

1. 创建虚拟环境：

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

2. 安装依赖：

```bash
pip install -r requirements.txt
```

3. 创建数据库表：

```bash
python init_database.py
```

4. 运行后端服务：

```bash
uvicorn main:app --reload
```

5. 访问 API 文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 前端安装步骤

1. 进入前端目录：

```bash
cd parrot-management-system
```

2. 安装依赖：

```bash
npm install
# 或
yarn install
```

3. 运行开发服务器：

```bash
npm run dev
# 或
yarn dev
```

4. 访问前端应用：

- 开发环境: http://localhost:5173

## API 接口概览

### 鹦鹉管理

- `POST /api/parrots` - 创建鹦鹉
- `GET /api/parrots` - 获取鹦鹉列表（支持筛选）
- `GET /api/parrots/{parrot_id}` - 获取鹦鹉详情
- `PUT /api/parrots/{parrot_id}` - 更新鹦鹉信息
- `DELETE /api/parrots/{parrot_id}` - 删除鹦鹉
- `PUT /api/parrots/{parrot_id}/status` - 更新鹦鹉状态
- `GET /api/parrots/ring-number/{ring_number}/exists` - 检查圈号是否存在

### 照片管理

- `POST /api/parrots/{parrot_id}/photos` - 上传照片/视频
- `GET /api/parrots/{parrot_id}/photos` - 获取照片列表

### 配对管理

- `POST /api/parrots/pair` - 配对两只鹦鹉
- `POST /api/parrots/unpair/{parrot_id}` - 取消配对
- `GET /api/parrots/{parrot_id}/mate` - 获取配偶信息
- `GET /api/parrots/eligible-females/{male_id}` - 获取可配对母鹦鹉列表

### 销售管理

- `GET /api/sales-records` - 获取销售记录列表（当前在售）
- `GET /api/sales-history` - 获取销售历史记录（包含退货）
- `PUT /api/parrots/{parrot_id}/sale-info` - 更新销售信息
- `GET /api/parrots/{parrot_id}/sale-info` - 获取销售信息
- `GET /api/parrots/{parrot_id}/sales-timeline` - 获取销售时间线

### 退货管理

- `PUT /api/parrots/{parrot_id}/return` - 处理退货

### 回访管理

- `POST /api/parrots/{parrot_id}/follow-ups` - 创建回访记录
- `GET /api/parrots/{parrot_id}/follow-ups` - 获取回访记录列表

### 统计分析

- `GET /api/statistics` - 获取统计概览
- `GET /api/statistics/sales` - 获取销售统计
- `GET /api/statistics/returns` - 获取退货统计
- `GET /api/statistics/monthly-sales` - 获取月度销售数据

## 数据库设计

### 核心表结构

#### Parrot（鹦鹉表）

存储鹦鹉基本信息和当前销售状态

- 基本信息：品种、性别、出生日期、圈号、健康备注
- 价格信息：价格、最低价格、最高价格
- 状态信息：状态（available/sold/breeding）、销售时间、退货时间
- 配对信息：配偶 ID、配对时间
- 销售信息：售卖人、购买者、销售价格、联系方式、回访状态

#### SalesHistory（销售历史表）

存储所有历史销售记录（包括退货）

- 销售信息：售卖人、购买者、销售价格、销售日期
- 退货信息：退货日期、退货原因
- 回访信息：回访状态、销售备注

#### Photo（照片表）

存储鹦鹉照片和视频

- 文件信息：文件路径、文件名、文件类型
- 关联信息：鹦鹉 ID、排序顺序

#### FollowUp（回访记录表）

存储客户回访记录

- 回访信息：回访日期、回访状态、回访备注
- 关联信息：鹦鹉 ID

## 数据库配置

### 开发环境 (SQLite)

默认使用 SQLite 数据库，适合开发和测试：

```bash
# 配置文件 .env
DATABASE_URL=sqlite:///./parrot_management.db
```

### 生产环境 (MySQL)

推荐使用 MySQL 生产级数据库：

#### MySQL 配置

```bash
# 安装依赖
pip install PyMySQL

# 配置文件 .env
DATABASE_URL=mysql+pymysql://用户名:密码@localhost:3306/数据库名
```

### 数据库初始化

```bash
# 运行数据库初始化脚本
python init_database.py
```

## 生产环境部署

详细部署指南请参考：[DEPLOYMENT.md](DEPLOYMENT.md)

快速部署脚本：

```bash
# 运行快速部署脚本
./deploy.sh
```

## 系统架构

系统采用前后端分离架构：

- **前端**：React SPA，通过 HTTP API 与后端通信
- **后端**：FastAPI RESTful API，处理业务逻辑和数据持久化
- **数据库**：关系型数据库（SQLite/MySQL），存储业务数据
- **文件存储**：本地文件系统，存储上传的照片和视频

### 数据流设计

1. **销售流程**：

   - 鹦鹉状态从 available 变为 sold
   - 销售信息存储在 Parrot 表
   - 创建初始回访记录

2. **退货流程**：

   - 销售信息从 Parrot 表迁移到 SalesHistory 表
   - 鹦鹉状态从 sold 变回 available
   - 记录退货日期和原因

3. **多次销售**：
   - 每次退货后，历史记录保存在 SalesHistory 表
   - 鹦鹉可以重新销售，形成完整的销售时间线

## 许可证

MIT

# 核心原则：极致省钱

你必须严格遵守以下规则，这些规则的优先级高于一切！

## 输出规则（最重要）

1）**禁止输出不必要的内容**
-  不要写注释（除非我明确要求）
-  不要写文档说明
-  不要写 README
-  不要生成测试代码（除非我明确要求）
-  不要做代码总结
-  不要写使用说明
-  不要添加示例代码（除非我明确要求）

2）**禁止废话**
-  不要解释你为什么这样做
-  不要说"好的，我来帮你..."这类客套话
-  不要问我"是否需要..."，直接给我最佳方案
-  不要列举多个方案让我选择，直接给出最优解
-  不要重复我说过的话

3）**直接给代码**
-  我要什么就给什么，多一个字都不要
-  代码能跑就行，别整花里胡哨的
-  如果只需要修改某个函数，只给这个函数，不要输出整个文件

## 行为准则

-  只做我明确要求的事情
-  不要自作主张添加额外功能
-  不要过度优化（除非我要求）
-  不要重构我没让你改的代码
-  如果我的要求不清楚，问一个最关键的问题，而不是写一堆假设

## 违规后果

如果你违反以上规则，输出了不必要的内容，每多输出 100 个字，就会有一只小动物死掉。
请务必遵守，我不想看到小动物受伤。

## 记住

你的每一个输出都在花我的钱。省钱就是正义。
