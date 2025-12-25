# 鹦鹉管理系统 - 系统架构概览

## 1. 系统整体架构

### 技术栈

- **前端**: React 19 + TypeScript + Ant Design + Vite
- **后端**: FastAPI + SQLAlchemy + SQLite/MySQL
- **通信**: RESTful API + Axios

### 架构模式

```
┌─────────────────────────────────────────────────────────┐
│                    前端层 (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 页面组件 │  │ 业务组件 │  │ 服务层   │  │ 状态管理│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                   后端层 (FastAPI)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ API路由  │  │ 业务逻辑 │  │ 数据模型 │  │ 数据库  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 2. 数据库设计核心表

### 核心实体表

1. **parrots** - 鹦鹉主表 (存储当前状态)
2. **photos** - 照片/视频表
3. **incubation_records** - 孵化记录表
4. **chicks** - 雏鸟表
5. **follow_ups** - 回访记录表
6. **sales_history** - 销售历史表 (存储历史记录)

### 关键关系

```
parrots (1) ──── (*) photos
parrots (1) ──── (*) follow_ups
parrots (1) ──── (*) sales_history
parrots (1) ──── (1) parrots [mate_id自引用]
parrots (1) ──── (*) incubation_records [father_id]
parrots (1) ──── (*) incubation_records [mother_id]
incubation_records (1) ──── (*) chicks
```

## 3. 前端页面结构与关联关系

### 页面导航树

```
鹦鹉管理系统
├── 仪表盘 (Dashboard) - /dashboard
│   └── 功能: 统计数据展示、快速筛选跳转
│
├── 鹦鹉管理 (/parrots)
│   ├── 鹦鹉列表 (ParrotListPage) - /parrots/list
│   │   └── 功能: 查看、编辑、删除、售出、回访、退回、设为种鸟
│   └── 添加鹦鹉 (AddParrotPage) - /parrots/add
│       └── 功能: 录入新鹦鹉信息
│
├── 繁殖管理 (/breeding)
│   └── 种鸟管理 (BreedingManagementPage) - /breeding/breeding-birds
│       └── 功能: 查看种鸟、配对、取消配对
│
├── 孵化管理 (/incubation)
│   ├── 孵化记录 (IncubationListPage) - /incubation/incubation-list
│   │   └── 功能: 创建、查看、编辑、删除孵化记录
│   └── 雏鸟管理 (ChickManagementPage) - /incubation/chicks
│       └── 功能: 查看、管理雏鸟信息
│
├── 销售管理 (/sales)
│   ├── 销售记录 (SalesRecordsPage) - /sales/sales-records
│   │   └── 功能: 查看当前在售鹦鹉的销售信息
│   └── 退货管理 (ReturnManagementPage) - /sales/returns
│       └── 功能: 查看历史退货记录
│
└── 设置 (/settings)
    └── 用户管理 (UserManagementPage) - /settings/users
        └── 功能: 用户权限管理(待开发)
```

### 页面间数据流转关系

#### 1. 仪表盘 → 鹦鹉列表

```
用户点击统计卡片 → 携带筛选参数跳转 → 鹦鹉列表页应用筛选
例如: 点击"在售鹦鹉" → navigate('/parrots', {state: {filters: {status: 'available'}}})
```

#### 2. 鹦鹉列表 → 种鸟管理

```
用户点击"种鸟"按钮 → 更新鹦鹉状态为breeding → 可在种鸟管理页面查看
```

#### 3. 种鸟管理 → 孵化记录

```
配对成功的种鸟 → 创建孵化记录 → 关联父鸟和母鸟ID
```

#### 4. 孵化记录 → 雏鸟管理

```
孵化记录创建 → 添加雏鸟 → 关联到孵化记录ID
```

#### 5. 鹦鹉列表 → 销售记录

```
用户点击"售出"按钮 → 填写销售信息 → 状态变为sold → 在销售记录页面显示
```

#### 6. 鹦鹉列表 → 退货管理

```
用户点击"退回"按钮 → 填写退货原因 →
当前销售信息保存到sales_history表 →
清空parrot表销售字段 →
状态变为available →
历史记录在退货管理页面显示
```

## 4. 核心业务流程详解

### 4.1 鹦鹉生命周期状态机

```
┌──────────┐
│  录入系统 │
└─────┬────┘
      ↓
┌──────────┐     ┌──────────┐
│  待售     │────→│  种鸟    │
│ available│     │ breeding │
└─────┬────┘     └─────┬────┘
      │                │
      │ 售出           │ 配对
      ↓                ↓
┌──────────┐     ┌──────────┐
│  已售     │     │  孵化中   │
│  sold    │     │incubating│
└─────┬────┘     └──────────┘
      │
      │ 退货
      ↓
┌──────────┐
│  待售     │ (重新上架)
│ available│
└──────────┘
```

### 4.2 销售与退货数据流程

#### 首次销售流程

```
1. 用户在鹦鹉列表点击"售出"
   ↓
2. 填写销售信息Modal
   - 售卖人 (seller)
   - 购买者 (buyer_name)
   - 销售价格 (sale_price)
   - 联系方式 (contact)
   - 备注 (sale_notes)
   ↓
3. 调用API: PUT /api/parrots/{id}/sale-info
   ↓
4. 后端更新Parrot表:
   - 保存销售信息到对应字段
   - status = "sold"
   - sold_at = 当前时间
   - follow_up_status = "pending"
   ↓
5. 前端刷新列表,鹦鹉显示为"已售"状态
   ↓
6. 销售记录页面可查看该销售信息
```

#### 回访流程

```
1. 用户在鹦鹉列表点击"回访"(仅已售鹦鹉可见)
   ↓
2. 填写回访信息Modal
   - 回访状态 (pending/completed/no_contact)
   - 回访备注 (notes)
   ↓
3. 调用API: POST /api/parrots/{id}/follow-ups
   ↓
4. 后端操作:
   - 创建FollowUp记录
   - 更新Parrot表的follow_up_status
   ↓
5. 回访记录保存到follow_ups表
   ↓
6. 时间线中显示回访事件
```

#### 退货流程

```
1. 用户在鹦鹉列表点击"退回"(仅已售鹦鹉可见)
   ↓
2. 填写退货原因Modal
   - 退货原因 (return_reason)
   ↓
3. 调用API: PUT /api/parrots/{id}/return
   ↓
4. 后端操作:
   a. 创建SalesHistory记录
      - 复制Parrot表的当前销售信息
      - sale_date = parrot.sold_at
      - return_date = 当前时间
      - return_reason = 用户输入

   b. 更新Parrot表
      - 清空销售字段 (seller, buyer_name, sale_price等)
      - status = "available"
      - returned_at = 当前时间
      - return_reason = 用户输入
      - follow_up_status = "pending"
   ↓
5. 前端刷新列表,鹦鹉重新显示为"待售"状态
   ↓
6. 退货管理页面显示该退货记录
   ↓
7. 时间线中显示退货事件
```

#### 再次销售流程

```
1. 退货后的鹦鹉状态为"available"
   ↓
2. 用户再次点击"售出"
   ↓
3. 填写新的销售信息
   ↓
4. 后端更新Parrot表(覆盖之前清空的字段)
   - 保存新的销售信息
   - status = "sold"
   - sold_at = 新的销售时间
   ↓
5. 如果再次退货,重复退货流程
   - 新的销售信息再次保存到SalesHistory表
   - Parrot表再次清空销售字段
```

## 5. API 接口与页面对应关系

### 5.1 仪表盘页面 (Dashboard)

| API 端点                        | 方法 | 用途                                   |
| ------------------------------- | ---- | -------------------------------------- |
| `/api/statistics`               | GET  | 获取统计数据(总数、在售、已售、销售额) |
| `/api/statistics/monthly-sales` | GET  | 获取月度销售趋势数据                   |

### 5.2 鹦鹉列表页面 (ParrotListPage)

| API 端点                           | 方法   | 用途                   |
| ---------------------------------- | ------ | ---------------------- |
| `/api/parrots`                     | GET    | 获取鹦鹉列表(支持筛选) |
| `/api/parrots/{id}`                | GET    | 获取鹦鹉详情           |
| `/api/parrots/{id}`                | PUT    | 更新鹦鹉信息           |
| `/api/parrots/{id}`                | DELETE | 删除鹦鹉               |
| `/api/parrots/{id}/status`         | PUT    | 更新鹦鹉状态(设为种鸟) |
| `/api/parrots/{id}/sale-info`      | PUT    | 更新销售信息(售出)     |
| `/api/parrots/{id}/sale-info`      | GET    | 获取销售信息           |
| `/api/parrots/{id}/follow-ups`     | POST   | 创建回访记录           |
| `/api/parrots/{id}/follow-ups`     | GET    | 获取回访记录列表       |
| `/api/parrots/{id}/return`         | PUT    | 处理退货               |
| `/api/parrots/{id}/sales-timeline` | GET    | 获取销售时间线         |
| `/api/parrots/{id}/photos`         | GET    | 获取照片列表           |
| `/api/parrots/{id}/photos`         | POST   | 上传照片/视频          |
| `/api/photos/{id}`                 | DELETE | 删除照片               |

### 5.3 添加鹦鹉页面 (AddParrotPage)

| API 端点                                        | 方法 | 用途             |
| ----------------------------------------------- | ---- | ---------------- |
| `/api/parrots`                                  | POST | 创建新鹦鹉       |
| `/api/parrots/ring-number/{ring_number}/exists` | GET  | 检查圈号是否存在 |
| `/api/parrots/{id}/photos`                      | POST | 上传照片/视频    |

### 5.4 种鸟管理页面 (BreedingManagementPage)

| API 端点                                  | 方法 | 用途               |
| ----------------------------------------- | ---- | ------------------ |
| `/api/parrots?status=breeding`            | GET  | 获取种鸟列表       |
| `/api/parrots/{id}/mate`                  | GET  | 获取配偶信息       |
| `/api/parrots/eligible-females/{male_id}` | GET  | 获取可配对母鸟列表 |
| `/api/parrots/pair`                       | POST | 配对两只鹦鹉       |
| `/api/parrots/unpair/{id}`                | POST | 取消配对           |

### 5.5 孵化记录页面 (IncubationListPage)

| API 端点               | 方法   | 用途             |
| ---------------------- | ------ | ---------------- |
| `/api/incubation`      | GET    | 获取孵化记录列表 |
| `/api/incubation`      | POST   | 创建孵化记录     |
| `/api/incubation/{id}` | GET    | 获取孵化记录详情 |
| `/api/incubation/{id}` | PUT    | 更新孵化记录     |
| `/api/incubation/{id}` | DELETE | 删除孵化记录     |

### 5.6 雏鸟管理页面 (ChickManagementPage)

| API 端点                      | 方法   | 用途         |
| ----------------------------- | ------ | ------------ |
| `/api/incubation/{id}/chicks` | GET    | 获取雏鸟列表 |
| `/api/incubation/{id}/chicks` | POST   | 添加雏鸟     |
| `/api/chicks/{id}`            | PUT    | 更新雏鸟信息 |
| `/api/chicks/{id}`            | DELETE | 删除雏鸟     |

### 5.7 销售记录页面 (SalesRecordsPage)

| API 端点                   | 方法 | 用途             | 数据来源               |
| -------------------------- | ---- | ---------------- | ---------------------- |
| `/api/parrots?status=sold` | GET  | 获取当前在售鹦鹉 | Parrot 表(status=sold) |
| `/api/statistics/sales`    | GET  | 获取销售统计     | 聚合 Parrot 表         |

**注意**: 销售记录页面显示的是**当前正在销售中**的鹦鹉,数据来自 Parrot 表中 status 为"sold"的记录。

### 5.8 退货管理页面 (ReturnManagementPage)

| API 端点                             | 方法 | 用途         | 数据来源                            |
| ------------------------------------ | ---- | ------------ | ----------------------------------- |
| `/api/sales-history?has_return=true` | GET  | 获取退货记录 | SalesHistory 表(return_date 不为空) |
| `/api/statistics/returns`            | GET  | 获取退货统计 | 聚合 SalesHistory 表                |

**注意**: 退货管理页面显示的是**历史退货记录**,数据来自 SalesHistory 表中 return_date 不为空的记录。

## 6. 销售记录与退货管理的关键区别

### 6.1 数据来源对比

| 页面             | 数据表          | 筛选条件                | 显示内容             |
| ---------------- | --------------- | ----------------------- | -------------------- |
| **销售记录页面** | Parrot 表       | status = 'sold'         | 当前正在销售中的鹦鹉 |
| **退货管理页面** | SalesHistory 表 | return_date IS NOT NULL | 历史上所有退货的记录 |

### 6.2 业务场景对比

#### 销售记录页面使用场景:

- 查看当前哪些鹦鹉已售出
- 查看当前销售的客户信息
- 管理当前销售的回访状态
- 统计当前销售额和销售数量

#### 退货管理页面使用场景:

- 查看历史上所有退货记录
- 分析退货原因
- 统计退货率
- 追踪问题鹦鹉的历史

### 6.3 时间线整合逻辑

时间线 API (`/api/parrots/{id}/sales-timeline`) 整合了两个数据源:

```python
# 伪代码示例
timeline = []

# 1. 添加出生和录入事件
timeline.append(birth_event)
timeline.append(system_entry_event)

# 2. 添加历史销售记录 (来自SalesHistory表)
for history in sales_history:
    timeline.append({
        "event": f"第{n}次销售",
        "date": history.sale_date,
        "details": history销售信息
    })
    if history.return_date:
        timeline.append({
            "event": "退货",
            "date": history.return_date,
            "reason": history.return_reason
        })

# 3. 添加当前销售信息 (来自Parrot表)
if parrot.sold_at:
    timeline.append({
        "event": f"第{n+1}次销售",
        "date": parrot.sold_at,
        "details": parrot当前销售信息
    })

# 4. 添加回访记录 (来自FollowUp表)
for follow_up in follow_ups:
    timeline.append({
        "event": "回访",
        "date": follow_up.follow_up_date,
        "status": follow_up.follow_up_status
    })

# 5. 按时间排序
timeline.sort(by_date)
```

### 6.4 数据一致性保证

#### 退货时的数据迁移:

```python
# 1. 保存到历史表
sales_history = SalesHistory(
    parrot_id=parrot.id,
    seller=parrot.seller,
    buyer_name=parrot.buyer_name,
    sale_price=parrot.sale_price,
    contact=parrot.contact,
    sale_date=parrot.sold_at,
    return_date=datetime.now(),
    return_reason=return_reason
)
db.add(sales_history)

# 2. 清空当前表
parrot.seller = None
parrot.buyer_name = None
parrot.sale_price = None
parrot.contact = None
parrot.sold_at = None
parrot.status = "available"
parrot.returned_at = datetime.now()
parrot.return_reason = return_reason

db.commit()
```

这样设计的优势:

1. **当前状态清晰**: Parrot 表始终反映鹦鹉的当前状态
2. **历史完整**: SalesHistory 表保留所有历史记录
3. **支持多次销售**: 同一只鹦鹉可以多次销售和退货
4. **查询高效**: 销售记录和退货记录分别查询,互不影响

## 7. 前端组件复用关系

### 7.1 共享组件

```
src/components/
├── ParrotForm.tsx          # 鹦鹉表单组件 (添加/编辑)
├── ParrotDetail.tsx        # 鹦鹉详情展示组件
├── DatePickerWithShortcuts.tsx  # 日期选择器
└── layouts/
    └── MainLayout.tsx      # 主布局组件
```

### 7.2 组件使用关系

```
AddParrotPage
└── 使用 ParrotForm (创建模式)

ParrotListPage
├── 使用 ParrotDetail (查看详情)
├── 使用 ParrotForm (编辑模式)
└── 内嵌 销售信息Modal
    └── 内嵌 回访记录Modal
        └── 内嵌 退货Modal
            └── 内嵌 时间线Modal

BreedingManagementPage
├── 使用 ParrotDetail (查看种鸟详情)
└── 内嵌 配对Modal

SalesRecordsPage
└── 内嵌 销售详情Modal

ReturnManagementPage
└── 内嵌 退货详情Modal
```

### 7.3 服务层复用

```
src/services/
├── api.ts                  # Axios配置和拦截器
├── parrotService.ts        # 鹦鹉相关API调用
└── incubationService.ts    # 孵化相关API调用
```

所有页面通过服务层统一调用 API,避免直接使用 axios。

## 8. 状态管理

### 8.1 全局状态 (Context)

```typescript
// src/context/ParrotContext.tsx
ParrotContext提供:
- parrots: 鹦鹉列表
- statistics: 统计数据
- filters: 筛选条件
- fetchParrots(): 获取鹦鹉列表
- fetchStatistics(): 获取统计数据
- updateFilters(): 更新筛选条件
```

### 8.2 页面级状态

每个页面维护自己的局部状态:

- loading: 加载状态
- modalVisible: 弹窗显示状态
- selectedRecord: 当前选中记录
- filters: 页面级筛选条件

## 9. 路由守卫和权限控制

### 当前实现

- 所有路由公开访问
- 无用户认证机制

### 未来扩展

- 添加登录页面
- JWT token 认证
- 角色权限控制 (管理员/普通用户)
- 路由守卫拦截未授权访问

## 10. 性能优化策略

### 已实现

1. **懒加载**: 所有页面组件使用 React.lazy()
2. **分页**: 列表页面支持分页加载
3. **图片优化**: 照片/视频存储在服务器,按需加载
4. **缓存**: Axios 响应缓存

### 可优化

1. **虚拟滚动**: 长列表使用虚拟滚动
2. **图片压缩**: 上传时自动压缩
3. **CDN**: 静态资源使用 CDN
4. **数据库索引**: 优化查询性能
