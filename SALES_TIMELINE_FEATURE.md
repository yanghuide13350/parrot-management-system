# 销售流程时间线功能说明

## 功能概述

本次更新实现了完整的鹦鹉销售流程跟踪系统，包括销售、回访、退货等全生命周期管理。

## 核心功能

### 1. 操作按钮状态管理
- **待售状态 (available)**: 查看、编辑、售出、种鸟、删除
- **种鸟状态 (breeding)**: 查看、编辑、售出(禁用)、删除
- **已售状态 (sold)**: 查看、回访、退回
- **退货状态 (returned)**: 查看、编辑、重新售出

### 2. 回访管理
**API端点**: `POST /api/parrots/{id}/follow-ups`

**功能**:
- 记录回访时间
- 更新回访状态（待回访/已回访/无法联系）
- 添加回访备注
- 多次回访记录支持

**前端操作**:
- 点击"回访"按钮弹出Modal
- 填写回访状态和备注
- 自动保存到数据库

### 3. 退货处理
**API端点**: `PUT /api/parrots/{id}/return`

**功能**:
- 记录退货时间
- 保存退货原因
- **清除销售信息**（售卖人、购买者、价格等）
- **状态重置为"待售"**（可重新上架）
- 保留历史记录用于时间线展示

**前端操作**:
- 点击"退回"按钮弹出Modal
- 填写退货原因
- 自动更新状态

### 4. 销售流程时间线
**API端点**: `GET /api/parrots/{id}/sales-timeline`

**时间线事件**:
1. **出生** - 出生日期（青色）
2. **录入系统** - 创建时间（灰色）
3. **销售** - 售卖信息（绿色，带心形图标）
   - 售卖人
   - 购买者
   - 销售价格
   - 联系方式
4. **回访** - 回访记录（蓝色）
   - 回访状态
   - 备注信息
5. **退货** - 退货信息（红色）
   - 退货原因

**前端展示**:
- 使用Ant Design Timeline组件
- 左侧模式显示
- 按时间排序（从早到晚）
- 即使无数据也显示基础信息

## 数据库设计

### 新增表: follow_ups
```sql
CREATE TABLE follow_ups (
    id INTEGER PRIMARY KEY,
    parrot_id INTEGER NOT NULL,
    follow_up_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    follow_up_status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parrot_id) REFERENCES parrots(id)
);
```

### Parrot表变更
- 新增销售相关字段：seller, buyer_name, sale_price, contact, follow_up_status, sale_notes
- 退货相关字段：returned_at, return_reason
- 关联回访记录：follow_ups

## API接口列表

### 回访相关
- `POST /api/parrots/{id}/follow-ups` - 创建回访记录
- `GET /api/parrots/{id}/follow-ups` - 获取回访记录列表

### 退货相关
- `PUT /api/parrots/{id}/return` - 处理退货

### 时间线相关
- `GET /api/parrots/{id}/sales-timeline` - 获取销售流程时间线

## 业务流程

### 销售流程
1. 鹦鹉信息录入 → 状态：待售
2. 设置为种鸟 → 状态：种鸟
3. 配对管理 → 记录配对时间
4. 售卖操作 → 状态：已售，记录销售信息
5. 回访跟踪 → 记录回访状态和备注
6. 如需退货 → 状态：待售（重新上架），保留历史记录

### 数据完整性
- 退货后清除当前销售数据，但保留历史记录用于时间线
- 所有事件按时间排序展示
- 支持多次回访记录

## 技术实现

### 前端
- React + TypeScript
- Ant Design UI组件库
- Timeline组件展示流程
- Modal组件处理表单
- Axios进行API调用

### 后端
- FastAPI框架
- SQLAlchemy ORM
- Pydantic数据验证
- SQLite数据库（可扩展MySQL）

## 启动说明

### 后端启动
```bash
cd /Users/yanghuide1/Downloads/ParrotManagementSystem2
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端启动
```bash
cd parrot-management-system
npm install
npm run dev
```

### 访问地址
- 前端: http://localhost:5173
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 版本信息

- 版本: v1.1.0
- 更新日期: 2025-12-12
- 作者: Claude Code
