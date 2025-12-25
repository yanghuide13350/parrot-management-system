# 鹦鹉管理系统 - 设计文档

## 概述

本设计文档基于需求文档,详细规划鹦鹉管理系统的技术架构、组件设计、数据模型和测试策略。系统采用前后端分离架构,前端使用 React+TypeScript,后端使用 FastAPI+SQLAlchemy,数据库使用 SQLite(开发)/MySQL(生产)。

## 架构设计

### 整体架构

系统采用三层架构:

```
┌─────────────────────────────────────────────────────────┐
│                  表现层 (Presentation)                   │
│  React Components + Ant Design + TypeScript             │
│  - 页面组件 (Pages)                                      │
│  - 业务组件 (Components)                                 │
│  - 状态管理 (Context API)                                │
└─────────────────────────────────────────────────────────┘
                         ↕ REST API (JSON)
┌─────────────────────────────────────────────────────────┐
│                  业务逻辑层 (Business)                   │
│  FastAPI + Pydantic                                      │
│  - API路由 (Routers)                                     │
│  - 请求验证 (Schemas)                                    │
│  - 业务规则 (Business Logic)                             │
└─────────────────────────────────────────────────────────┘
                         ↕ ORM
┌─────────────────────────────────────────────────────────┐
│                  数据访问层 (Data)                       │
│  SQLAlchemy + SQLite/MySQL                               │
│  - 数据模型 (Models)                                     │
│  - 数据库会话 (Session)                                  │
│  - 关系映射 (Relationships)                              │
└─────────────────────────────────────────────────────────┘
```

### 技术选型理由

1. **前端 - React 19 + TypeScript**

   - React: 组件化开发,生态成熟
   - TypeScript: 类型安全,减少运行时错误
   - Ant Design: 企业级 UI 组件库,开箱即用

2. **后端 - FastAPI**

   - 自动生成 API 文档
   - 基于 Pydantic 的数据验证
   - 异步支持,性能优秀
   - 类型提示,开发体验好

3. **ORM - SQLAlchemy**

   - Python 最成熟的 ORM
   - 支持多种数据库
   - 关系映射强大
   - 迁移工具完善

4. **数据库 - SQLite/MySQL**
   - SQLite: 开发环境,零配置
   - MySQL: 生产环境,高性能

## 组件设计

### 前端组件架构

#### 1. 页面组件 (Pages)

**Dashboard.tsx** - 仪表盘

- 职责: 展示统计数据和图表
- 状态: statistics, monthlySales, chartType
- 交互: 点击卡片跳转到筛选列表

**ParrotListPage.tsx** - 鹦鹉列表

- 职责: 展示鹦鹉列表,支持 CRUD 操作
- 状态: parrots, filters, selectedParrot, modalStates
- 交互: 查看、编辑、删除、售出、回访、退回、设为种鸟
- 子组件: ParrotDetailModal, SaleInfoModal, FollowUpModal, ReturnModal, TimelineModal

**AddParrotPage.tsx** - 添加鹦鹉

- 职责: 创建新鹦鹉记录
- 状态: formData, photos, ringNumberExists
- 验证: 圈号唯一性、价格区间合法性
- 交互: 表单填写、照片上传、实时验证

**BreedingManagementPage.tsx** - 种鸟管理

- 职责: 管理种鸟配对关系
- 状态: breedingBirds, selectedMale, eligibleFemales
- 交互: 查看配对、配对、取消配对
- 业务规则: 一公一母、双方未配对、双方为种鸟状态

**IncubationListPage.tsx** - 孵化记录

- 职责: 管理孵化记录
- 状态: incubationRecords, selectedRecord
- 交互: 创建、查看、编辑、删除孵化记录
- 关联: 父鸟、母鸟、雏鸟列表

**ChickManagementPage.tsx** - 雏鸟管理

- 职责: 管理雏鸟信息
- 状态: chicks, selectedChick
- 交互: 查看、编辑、删除雏鸟
- 关联: 所属孵化记录

**SalesRecordsPage.tsx** - 销售记录

- 职责: 展示当前在售鹦鹉
- 数据源: Parrot 表 (status=sold)
- 状态: salesRecords, statistics, filters
- 交互: 查看销售详情、筛选、统计

**ReturnManagementPage.tsx** - 退货管理

- 职责: 展示历史退货记录
- 数据源: SalesHistory 表 (return_date 不为空)
- 状态: returnRecords, statistics, filters
- 交互: 查看退货详情、筛选、统计

#### 2. 业务组件 (Components)

**ParrotForm.tsx** - 鹦鹉表单

- 职责: 鹦鹉信息的表单输入
- Props: mode (create/edit), initialValues, onSubmit
- 验证: 必填字段、价格区间、圈号唯一性

**ParrotDetail.tsx** - 鹦鹉详情

- 职责: 展示鹦鹉详细信息
- Props: parrot, showPhotos, showTimeline
- 布局: 基本信息、照片展示、时间线

**DatePickerWithShortcuts.tsx** - 日期选择器

- 职责: 提供快捷日期选择
- Props: value, onChange, shortcuts
- 快捷选项: 今天、昨天、本周、本月

#### 3. 布局组件 (Layouts)

**MainLayout.tsx** - 主布局

- 职责: 提供统一的页面布局
- 组成: 侧边栏导航、顶部栏、内容区域
- 导航: 仪表盘、鹦鹉管理、繁殖管理、孵化管理、销售管理、设置

### 后端 API 设计

#### 1. 鹦鹉管理 API (parrots.py)

```python
# 基础CRUD
GET    /api/parrots              # 获取列表(支持筛选)
POST   /api/parrots              # 创建鹦鹉
GET    /api/parrots/{id}         # 获取详情
PUT    /api/parrots/{id}         # 更新信息
DELETE /api/parrots/{id}         # 删除鹦鹉

# 状态管理
PUT    /api/parrots/{id}/status  # 更新状态

# 配对管理
GET    /api/parrots/{id}/mate    # 获取配偶信息
POST   /api/parrots/pair         # 配对
POST   /api/parrots/unpair/{id}  # 取消配对
GET    /api/parrots/eligible-females/{male_id}  # 获取可配对母鸟

# 销售管理
PUT    /api/parrots/{id}/sale-info     # 更新销售信息
GET    /api/parrots/{id}/sale-info     # 获取销售信息
POST   /api/parrots/{id}/follow-ups    # 创建回访记录
GET    /api/parrots/{id}/follow-ups    # 获取回访记录
PUT    /api/parrots/{id}/return        # 处理退货
GET    /api/parrots/{id}/sales-timeline # 获取时间线

# 照片管理
GET    /api/parrots/{id}/photos  # 获取照片列表
POST   /api/parrots/{id}/photos  # 上传照片
DELETE /api/photos/{id}          # 删除照片

# 验证
GET    /api/parrots/ring-number/{ring_number}/exists  # 检查圈号
```

#### 2. 孵化管理 API (incubation.py)

```python
# 孵化记录
GET    /api/incubation           # 获取列表
POST   /api/incubation           # 创建记录
GET    /api/incubation/{id}      # 获取详情
PUT    /api/incubation/{id}      # 更新记录
DELETE /api/incubation/{id}      # 删除记录

# 雏鸟管理
GET    /api/incubation/{id}/chicks  # 获取雏鸟列表
POST   /api/incubation/{id}/chicks  # 添加雏鸟
PUT    /api/chicks/{id}             # 更新雏鸟
DELETE /api/chicks/{id}             # 删除雏鸟
```

#### 3. 统计 API (statistics.py)

```python
GET    /api/statistics            # 获取统计数据
GET    /api/statistics/monthly-sales  # 获取月度销售
GET    /api/statistics/sales     # 获取销售统计
GET    /api/statistics/returns   # 获取退货统计
```

## 数据模型

### 核心模型设计

#### 1. Parrot (鹦鹉模型)

```python
class Parrot(Base):
    # 基础信息
    id: int                    # 主键
    breed: str                 # 品种
    gender: str                # 性别(公/母/未验卡)
    birth_date: date           # 出生日期
    ring_number: str           # 圈号(唯一)

    # 价格信息
    price: Decimal             # 当前价格
    min_price: Decimal         # 最低价格
    max_price: Decimal         # 最高价格

    # 状态信息
    status: str                # 状态(available/sold/returned/breeding)
    health_notes: str          # 健康备注

    # 配对信息
    mate_id: int               # 配偶ID(自引用外键)
    paired_at: datetime        # 配对时间

    # 销售信息(当前)
    seller: str                # 售卖人
    buyer_name: str            # 购买者
    sale_price: Decimal        # 销售价格
    contact: str               # 联系方式
    follow_up_status: str      # 回访状态
    sale_notes: str            # 销售备注
    sold_at: datetime          # 销售时间

    # 退货信息(当前)
    returned_at: datetime      # 退货时间
    return_reason: str         # 退货原因

    # 时间戳
    created_at: datetime       # 创建时间
    updated_at: datetime       # 更新时间

    # 关系
    photos: List[Photo]        # 照片列表
    follow_ups: List[FollowUp] # 回访记录
    sales_history: List[SalesHistory]  # 销售历史
    mate: Parrot               # 配偶
```

**设计要点**:

- ring_number 设置唯一约束
- status 使用枚举值
- 销售字段在退货时清空
- mate_id 自引用实现配对关系

#### 2. SalesHistory (销售历史模型)

```python
class SalesHistory(Base):
    id: int                    # 主键
    parrot_id: int             # 鹦鹉ID(外键)

    # 销售信息
    seller: str                # 售卖人
    buyer_name: str            # 购买者
    sale_price: Decimal        # 销售价格
    contact: str               # 联系方式
    follow_up_status: str      # 回访状态
    sale_notes: str            # 销售备注

    # 时间信息
    sale_date: datetime        # 销售时间
    return_date: datetime      # 退货时间(可为空)
    return_reason: str         # 退货原因(可为空)

    # 时间戳
    created_at: datetime       # 创建时间
    updated_at: datetime       # 更新时间

    # 关系
    parrot: Parrot             # 关联鹦鹉
```

**设计要点**:

- 退货时从 Parrot 表复制数据创建
- return_date 不为空表示已退货
- 支持一只鹦鹉多次销售历史

#### 3. FollowUp (回访记录模型)

```python
class FollowUp(Base):
    id: int                    # 主键
    parrot_id: int             # 鹦鹉ID(外键)
    follow_up_date: datetime   # 回访日期
    follow_up_status: str      # 回访状态(pending/completed/no_contact)
    notes: str                 # 回访备注
    created_at: datetime       # 创建时间
    updated_at: datetime       # 更新时间

    # 关系
    parrot: Parrot             # 关联鹦鹉
```

**设计要点**:

- 支持多次回访记录
- 每次回访更新 Parrot 表的 follow_up_status

#### 4. Photo (照片模型)

```python
class Photo(Base):
    id: int                    # 主键
    parrot_id: int             # 鹦鹉ID(外键)
    file_path: str             # 文件路径
    file_name: str             # 文件名
    file_type: str             # 文件类型(image/video)
    sort_order: int            # 排序权重
    created_at: datetime       # 创建时间

    # 关系
    parrot: Parrot             # 关联鹦鹉
```

**设计要点**:

- 支持图片和视频
- 级联删除(删除鹦鹉时删除照片)
- 按 sort_order 排序

#### 5. IncubationRecord (孵化记录模型)

```python
class IncubationRecord(Base):
    id: int                    # 主键
    father_id: int             # 父鸟ID(外键)
    mother_id: int             # 母鸟ID(外键)
    start_date: date           # 开始日期
    expected_hatch_date: date  # 预计孵化日期
    status: str                # 状态
    notes: str                 # 备注
    created_at: datetime       # 创建时间
    updated_at: datetime       # 更新时间

    # 关系
    father: Parrot             # 父鸟
    mother: Parrot             # 母鸟
    chicks: List[Chick]        # 雏鸟列表
```

#### 6. Chick (雏鸟模型)

```python
class Chick(Base):
    id: int                    # 主键
    incubation_record_id: int  # 孵化记录ID(外键)
    hatch_date: date           # 孵化日期
    ring_number: str           # 圈号
    status: str                # 状态
    notes: str                 # 备注
    created_at: datetime       # 创建时间
    updated_at: datetime       # 更新时间

    # 关系
    incubation_record: IncubationRecord  # 孵化记录
```

### 数据库关系图

```
Parrot (1) ──── (*) Photo
Parrot (1) ──── (*) FollowUp
Parrot (1) ──── (*) SalesHistory
Parrot (1) ──── (0..1) Parrot [mate_id]
Parrot (1) ──── (*) IncubationRecord [father_id]
Parrot (1) ──── (*) IncubationRecord [mother_id]
IncubationRecord (1) ──── (*) Chick
```

## 接口设计

### 请求/响应 Schema 设计

#### 1. Parrot 相关 Schema

```python
# 创建请求
class ParrotCreate(BaseModel):
    breed: str
    gender: str
    birth_date: date
    ring_number: str
    price: Optional[Decimal]
    min_price: Optional[Decimal]
    max_price: Optional[Decimal]
    health_notes: Optional[str]

# 更新请求
class ParrotUpdate(BaseModel):
    breed: Optional[str]
    gender: Optional[str]
    birth_date: Optional[date]
    ring_number: Optional[str]
    price: Optional[Decimal]
    min_price: Optional[Decimal]
    max_price: Optional[Decimal]
    health_notes: Optional[str]

# 响应
class ParrotResponse(BaseModel):
    id: int
    breed: str
    gender: str
    birth_date: Optional[date]
    ring_number: Optional[str]
    price: Optional[Decimal]
    status: str
    health_notes: Optional[str]
    mate_id: Optional[int]
    paired_at: Optional[str]
    created_at: str
    updated_at: str
    photo_count: int

# 列表响应
class ParrotList(BaseModel):
    total: int
    items: List[ParrotResponse]
    page: int
    size: int
```

#### 2. 销售相关 Schema

```python
# 销售信息更新
class ParrotSaleUpdate(BaseModel):
    seller: str
    buyer_name: str
    sale_price: Decimal
    contact: str
    follow_up_status: str = "pending"
    notes: Optional[str]

# 销售信息响应
class SaleInfoResponse(BaseModel):
    seller: str
    buyer_name: str
    sale_price: float
    contact: str
    follow_up_status: str
    notes: Optional[str]

# 回访创建
class FollowUpCreate(BaseModel):
    follow_up_status: str
    notes: Optional[str]

# 回访响应
class FollowUpResponse(BaseModel):
    id: int
    parrot_id: int
    follow_up_date: str
    follow_up_status: str
    notes: Optional[str]
    created_at: str
    updated_at: str

# 退货更新
class ParrotReturnUpdate(BaseModel):
    return_reason: str
```

### API 错误处理

#### 自定义异常

```python
class ParrotManagementException(Exception):
    """基础异常类"""
    pass

class NotFoundException(ParrotManagementException):
    """资源未找到"""
    pass

class BadRequestException(ParrotManagementException):
    """请求参数错误"""
    pass

class ConflictException(ParrotManagementException):
    """资源冲突"""
    pass
```

#### 全局异常处理器

```python
@app.exception_handler(Exception)
async def exception_handler(request, exc):
    if isinstance(exc, NotFoundException):
        return JSONResponse(
            status_code=404,
            content={"detail": str(exc)}
        )
    elif isinstance(exc, BadRequestException):
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc)}
        )
    elif isinstance(exc, ConflictException):
        return JSONResponse(
            status_code=409,
            content={"detail": str(exc)}
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
```

## 正确性属性

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

基于需求分析,我们识别出以下可测试的正确性属性:

### 属性 1: 鹦鹉创建完整性

*对于任意*有效的鹦鹉数据(品种、性别、出生日期、圈号、价格区间、健康备注),创建后查询应返回包含所有字段的记录
**验证需求: 1.1**

### 属性 2: 圈号唯一性约束

*对于任意*已存在的圈号,尝试创建具有相同圈号的新鹦鹉应被系统拒绝
**验证需求: 1.2**

### 属性 3: 价格区间验证

*对于任意*价格组合,当最低价格大于最高价格时,系统应拒绝创建或更新操作
**验证需求: 1.3, 13.2**

### 属性 4: 筛选结果正确性

*对于任意*筛选条件(品种、性别、状态、价格区间、年龄范围),返回的所有鹦鹉应满足该筛选条件
**验证需求: 1.4**

### 属性 5: 照片关联完整性

*对于任意*鹦鹉和上传的照片/视频文件,上传后查询该鹦鹉的照片列表应包含该文件
**验证需求: 1.5**

### 属性 6: 初始状态正确性

*对于任意*新创建的鹦鹉,其状态应为"available"
**验证需求: 2.1**

### 属性 7: 状态转换正确性

*对于任意*状态为"available"的鹦鹉,设为种鸟后状态应变为"breeding"
**验证需求: 2.2**

### 属性 8: 销售状态更新

*对于任意*鹦鹉,完成销售后状态应为"sold"且 sold_at 字段应被设置
**验证需求: 2.3, 6.2**

### 属性 9: 退货状态重置

*对于任意*已售鹦鹉,退货后状态应重置为"available"且销售字段应被清空
**验证需求: 2.4, 8.3, 8.5**

### 属性 10: 状态筛选正确性

*对于任意*状态值,按该状态筛选返回的所有鹦鹉应具有该状态
**验证需求: 2.5**

### 属性 11: 配对性别验证

*对于任意*两只鹦鹉,只有当一只性别为"公"且另一只为"母"时配对才能成功
**验证需求: 3.1**

### 属性 12: 配对状态验证

*对于任意*两只鹦鹉,只有当双方状态都为"breeding"时配对才能成功
**验证需求: 3.2**

### 属性 13: 配对唯一性验证

*对于任意*鹦鹉,如果已有配偶(mate_id 不为空),则不能与其他鹦鹉配对
**验证需求: 3.3**

### 属性 14: 配对双向关联

*对于任意*成功配对的两只鹦鹉 A 和 B,A 的 mate_id 应等于 B 的 id,且 B 的 mate_id 应等于 A 的 id
**验证需求: 3.4**

### 属性 15: 取消配对完整性

*对于任意*已配对的鹦鹉,取消配对后双方的 mate_id 和 paired_at 应都为空
**验证需求: 3.5**

### 属性 16: 可配对对象查询正确性

*对于任意*公鹦鹉,查询其可配对对象返回的所有母鹦鹉应满足:性别为"母"、状态为"breeding"、mate_id 为空
**验证需求: 3.6**

### 属性 17: 销售信息完整性

*对于任意*销售信息(售卖人、购买者、价格、联系方式),售出后查询应返回完整的销售信息
**验证需求: 6.1**

### 属性 18: 销售初始化回访状态

*对于任意*鹦鹉,售出后 follow_up_status 应为"pending"
**验证需求: 6.3**

### 属性 19: 回访记录创建完整性

*对于任意*回访信息(时间、状态、备注),创建后查询应返回包含所有字段的回访记录
**验证需求: 7.1**

### 属性 20: 回访状态同步

*对于任意*鹦鹉,创建回访记录后 Parrot 表的 follow_up_status 应与回访记录的状态一致
**验证需求: 7.2**

### 属性 21: 退货状态验证

*对于任意*鹦鹉,只有当状态为"sold"时退货操作才能成功
**验证需求: 8.1**

### 属性 22: 退货历史记录创建

*对于任意*已售鹦鹉,退货后 SalesHistory 表应有新记录且包含完整的销售信息
**验证需求: 8.2, 9.1**

### 属性 23: 退货信息记录

*对于任意*退货操作,退货后 returned_at 和 return_reason 字段应被正确设置
**验证需求: 8.4**

### 属性 24: 多次销售历史完整性

*对于任意*鹦鹉,经过多次售出和退货后,SalesHistory 表应有多条记录且按 sale_date 排序
**验证需求: 9.4**

### 属性 25: 时间线事件排序

*对于任意*鹦鹉,查询时间线返回的所有事件应按时间从早到晚排序
**验证需求: 10.7**

### 属性 26: 级联删除完整性

*对于任意*鹦鹉及其关联的照片,删除鹦鹉后查询照片应返回空列表
**验证需求: 13.4**

### 属性反思与优化

经过分析,我们发现以下属性可以合并或优化:

1. **属性 3 和 13.2 重复** - 都测试价格验证,保留属性 3
2. **属性 8 包含 6.2** - 销售状态更新已包含状态和时间戳验证
3. **属性 9 综合了 2.4, 8.3, 8.5** - 退货状态重置是一个综合属性
4. **属性 22 综合了 8.2 和 9.1** - 退货历史记录创建是一个综合属性

最终保留 26 个核心属性,覆盖所有可测试的需求。

## 错误处理

### 错误分类

#### 1. 客户端错误 (4xx)

**400 Bad Request** - 请求参数错误

- 必填字段缺失
- 数据格式错误
- 业务规则验证失败(如价格区间错误)

示例:

```json
{
  "detail": "最低价格不能高于最高价格"
}
```

**404 Not Found** - 资源不存在

- 鹦鹉 ID 不存在
- 照片 ID 不存在
- 孵化记录不存在

示例:

```json
{
  "detail": "未找到ID为 123 的鹦鹉"
}
```

**409 Conflict** - 资源冲突

- 圈号重复
- 配对冲突(已配对的鹦鹉)
- 状态冲突(非已售鹦鹉不能退货)

示例:

```json
{
  "detail": "圈号 A001 已存在,请使用其他圈号"
}
```

#### 2. 服务器错误 (5xx)

**500 Internal Server Error** - 服务器内部错误

- 数据库连接失败
- 文件系统错误
- 未预期的异常

示例:

```json
{
  "detail": "Internal server error"
}
```

### 错误处理策略

#### 后端错误处理

1. **输入验证**: 使用 Pydantic Schema 自动验证
2. **业务规则验证**: 在 API 层手动验证
3. **数据库约束**: 捕获 IntegrityError 并转换为友好错误
4. **全局异常处理**: 统一错误响应格式

```python
# 示例: 圈号重复处理
try:
    db.commit()
except IntegrityError as e:
    db.rollback()
    if "ring_number" in str(e):
        raise BadRequestException(f"圈号 {ring_number} 已存在")
    raise BadRequestException(f"创建失败: {str(e)}")
```

#### 前端错误处理

1. **表单验证**: 使用 Ant Design Form 验证规则
2. **API 错误**: Axios 拦截器统一处理
3. **用户提示**: 使用 message 组件显示错误信息

```typescript
// Axios拦截器
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      message.error(error.response.data.detail || "操作失败");
    } else {
      message.error("网络错误,请稍后重试");
    }
    return Promise.reject(error);
  }
);
```

### 数据完整性保证

#### 数据库约束

1. **主键约束**: 所有表都有自增主键
2. **外键约束**: 关联关系使用外键
3. **唯一约束**: ring_number 唯一
4. **非空约束**: 必填字段设置 NOT NULL
5. **级联删除**: 照片、回访记录、销售历史级联删除

#### 事务管理

关键操作使用数据库事务:

```python
# 退货操作事务
try:
    # 1. 创建历史记录
    sales_history = SalesHistory(...)
    db.add(sales_history)

    # 2. 清空当前销售信息
    parrot.seller = None
    parrot.buyer_name = None
    # ...

    # 3. 提交事务
    db.commit()
except Exception as e:
    db.rollback()
    raise
```

## 测试策略

### 测试金字塔

```
        /\
       /  \
      / E2E\      少量端到端测试
     /______\
    /        \
   /Integration\   中量集成测试
  /____________\
 /              \
/  Unit + PBT   \  大量单元测试和属性测试
/________________\
```

### 单元测试

**测试范围**:

- API 端点的基本功能
- Schema 验证逻辑
- 业务规则验证
- 错误处理

**测试工具**: pytest

**示例**:

```python
def test_create_parrot_success():
    """测试成功创建鹦鹉"""
    response = client.post("/api/parrots", json={
        "breed": "玄凤",
        "gender": "公",
        "birth_date": "2024-01-01",
        "ring_number": "A001",
        "min_price": 100,
        "max_price": 200
    })
    assert response.status_code == 201
    assert response.json()["breed"] == "玄凤"
    assert response.json()["status"] == "available"

def test_create_parrot_duplicate_ring_number():
    """测试圈号重复"""
    # 先创建一个鹦鹉
    client.post("/api/parrots", json={...})

    # 尝试用相同圈号创建
    response = client.post("/api/parrots", json={
        "ring_number": "A001",
        ...
    })
    assert response.status_code == 400
    assert "已存在" in response.json()["detail"]
```

### 属性测试 (Property-Based Testing)

**测试工具**: Hypothesis (Python)

**测试策略**:

- 每个属性测试运行至少 100 次迭代
- 使用智能生成器生成测试数据
- 每个测试明确标注对应的设计文档属性

**示例**:

```python
from hypothesis import given, strategies as st

@given(
    breed=st.text(min_size=1, max_size=100),
    gender=st.sampled_from(["公", "母", "未验卡"]),
    ring_number=st.text(min_size=1, max_size=50)
)
def test_property_1_parrot_creation_completeness(breed, gender, ring_number):
    """
    **Feature: parrot-system-architecture, Property 1: 鹦鹉创建完整性**
    对于任意有效的鹦鹉数据,创建后查询应返回包含所有字段的记录
    """
    # 创建鹦鹉
    response = client.post("/api/parrots", json={
        "breed": breed,
        "gender": gender,
        "ring_number": ring_number,
        "birth_date": "2024-01-01"
    })

    if response.status_code == 201:
        parrot_id = response.json()["id"]

        # 查询鹦鹉
        get_response = client.get(f"/api/parrots/{parrot_id}")
        assert get_response.status_code == 200

        data = get_response.json()
        assert data["breed"] == breed
        assert data["gender"] == gender
        assert data["ring_number"] == ring_number

@given(
    min_price=st.decimals(min_value=0, max_value=10000),
    max_price=st.decimals(min_value=0, max_value=10000)
)
def test_property_3_price_range_validation(min_price, max_price):
    """
    **Feature: parrot-system-architecture, Property 3: 价格区间验证**
    对于任意价格组合,当最低价格大于最高价格时,系统应拒绝
    """
    response = client.post("/api/parrots", json={
        "breed": "玄凤",
        "gender": "公",
        "ring_number": f"TEST{random.randint(1000, 9999)}",
        "min_price": float(min_price),
        "max_price": float(max_price)
    })

    if min_price > max_price:
        assert response.status_code == 400
    else:
        assert response.status_code in [201, 400]  # 可能因其他原因失败
```

### 集成测试

**测试范围**:

- 完整的业务流程
- 多个 API 的组合调用
- 数据库事务完整性

**示例**:

```python
def test_sale_and_return_flow():
    """测试完整的销售和退货流程"""
    # 1. 创建鹦鹉
    create_response = client.post("/api/parrots", json={...})
    parrot_id = create_response.json()["id"]

    # 2. 售出鹦鹉
    sale_response = client.put(f"/api/parrots/{parrot_id}/sale-info", json={
        "seller": "张三",
        "buyer_name": "李四",
        "sale_price": 500,
        "contact": "13800138000"
    })
    assert sale_response.status_code == 200

    # 3. 验证状态
    parrot = client.get(f"/api/parrots/{parrot_id}").json()
    assert parrot["status"] == "sold"

    # 4. 退货
    return_response = client.put(f"/api/parrots/{parrot_id}/return", json={
        "return_reason": "健康问题"
    })
    assert return_response.status_code == 200

    # 5. 验证状态重置
    parrot = client.get(f"/api/parrots/{parrot_id}").json()
    assert parrot["status"] == "available"
    assert parrot["seller"] is None

    # 6. 验证历史记录
    # (需要实现销售历史查询API)
```

### 前端测试

**测试工具**: React Testing Library + Jest

**测试范围**:

- 组件渲染
- 用户交互
- API 调用 mock

**示例**:

```typescript
describe("ParrotListPage", () => {
  it("should display parrot list", async () => {
    // Mock API
    jest.spyOn(ParrotService, "getParrots").mockResolvedValue({
      data: {
        items: [{ id: 1, breed: "玄凤", status: "available" }],
        total: 1,
      },
    });

    render(<ParrotListPage />);

    await waitFor(() => {
      expect(screen.getByText("玄凤")).toBeInTheDocument();
    });
  });
});
```

### 测试覆盖率目标

- 单元测试覆盖率: ≥ 80%
- 属性测试: 覆盖所有 26 个核心属性
- 集成测试: 覆盖所有关键业务流程
- 前端测试: 覆盖所有页面组件的核心功能

### 持续集成

使用 GitHub Actions 或类似 CI 工具:

1. 每次提交自动运行测试
2. 测试失败阻止合并
3. 生成测试覆盖率报告
4. 属性测试失败时保存反例
