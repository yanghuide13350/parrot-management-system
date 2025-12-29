# Design Document: 鹦鹉分享链接功能

## Overview

本设计文档描述鹦鹉管理系统的在线分享链接功能实现方案。该功能允许用户为鹦鹉生成唯一的分享链接，买家通过链接可以直接查看鹦鹉信息、照片和视频，无需下载文件。

核心设计原则：

- 简单易用：一键生成，自动复制
- 移动端优先：分享页面针对手机浏览器优化
- 安全可控：链接有有效期，可随时删除

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ParrotDetail.tsx          │  SharePage.tsx (新增)          │
│  - 生成分享链接按钮         │  - 公开访问的展示页面           │
│  - 管理已有链接             │  - 移动端响应式设计             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
├─────────────────────────────────────────────────────────────┤
│  app/api/share.py (新增)                                     │
│  - POST /api/share/generate/{parrot_id}  生成分享链接        │
│  - GET  /api/share/{token}               获取分享数据        │
│  - GET  /api/share/list/{parrot_id}      获取链接列表        │
│  - DELETE /api/share/{token}             删除分享链接        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (SQLite/PostgreSQL)            │
├─────────────────────────────────────────────────────────────┤
│  share_links 表                                              │
│  - id, parrot_id, token, created_at, expires_at, is_active  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 后端 API 组件 (app/api/share.py)

```python
# 生成分享链接
@router.post("/generate/{parrot_id}")
def generate_share_link(parrot_id: int, db: Session) -> ShareLinkResponse:
    """
    为指定鹦鹉生成分享链接
    - 生成16字符以上的随机token
    - 设置7天有效期
    - 返回完整URL
    """
    pass

# 获取分享数据（公开接口）
@router.get("/{token}")
def get_share_data(token: str, db: Session) -> ShareDataResponse:
    """
    根据token获取分享数据
    - 验证token有效性和过期时间
    - 返回鹦鹉信息和媒体列表
    """
    pass

# 获取鹦鹉的分享链接列表
@router.get("/list/{parrot_id}")
def get_share_links(parrot_id: int, db: Session) -> List[ShareLinkResponse]:
    """
    获取指定鹦鹉的所有有效分享链接
    """
    pass

# 删除分享链接
@router.delete("/{token}")
def delete_share_link(token: str, db: Session) -> dict:
    """
    删除（使失效）指定的分享链接
    """
    pass
```

### 2. 数据模型 (app/models/share_link.py)

```python
class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    parrot_id = Column(Integer, ForeignKey("parrots.id"), nullable=False)
    token = Column(String(64), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    parrot = relationship("Parrot", back_populates="share_links")
```

### 3. 前端分享页面组件 (SharePage.tsx)

```typescript
// 路由: /share/:token
const SharePage: React.FC = () => {
  // 根据token获取分享数据
  // 展示鹦鹉信息和媒体
  // 移动端优先的响应式设计
};
```

### 4. API 响应 Schema

```python
class ShareLinkResponse(BaseModel):
    token: str
    url: str
    created_at: str
    expires_at: str
    remaining_days: int

class ShareDataResponse(BaseModel):
    status: str  # "valid", "expired", "invalid"
    parrot: Optional[ParrotShareInfo]
    photos: Optional[List[PhotoInfo]]
    message: Optional[str]

class ParrotShareInfo(BaseModel):
    breed: str
    gender: str
    price: float
    birth_date: Optional[str]
    ring_number: Optional[str]
    health_notes: Optional[str]
    status: str
```

## Data Models

### share_links 表结构

| 字段       | 类型        | 说明                   |
| ---------- | ----------- | ---------------------- |
| id         | INTEGER     | 主键，自增             |
| parrot_id  | INTEGER     | 外键，关联 parrots 表  |
| token      | VARCHAR(64) | 唯一标识符，用于 URL   |
| created_at | DATETIME    | 创建时间               |
| expires_at | DATETIME    | 过期时间               |
| is_active  | BOOLEAN     | 是否有效（用于软删除） |

### Token 生成规则

- 使用 `secrets.token_urlsafe(16)` 生成 22 字符的 URL 安全 token
- Token 在数据库中唯一索引，确保不重复
- 生成失败时重试最多 3 次

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: 链接生成完整性

_For any_ valid parrot_id, when generating a share link, the system SHALL return a valid URL containing a token of at least 16 characters, AND create a database record with parrot_id, token, created_at, and expires_at fields all populated.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Token 唯一性

_For any_ set of generated tokens, all tokens SHALL be unique (no duplicates).

**Validates: Requirements 1.3**

### Property 3: 多链接独立性

_For any_ parrot, generating a new share link SHALL NOT invalidate or affect any previously generated valid links for the same parrot.

**Validates: Requirements 1.5**

### Property 4: 有效链接数据完整性

_For any_ valid (non-expired, active) share link, accessing it SHALL return the complete parrot information (breed, gender, price, birth_date, ring_number, health_notes, status) AND all associated photos/videos.

**Validates: Requirements 2.1, 2.2**

### Property 5: 默认有效期

_For any_ newly generated share link, the expires_at timestamp SHALL be exactly 7 days after the created_at timestamp.

**Validates: Requirements 3.1**

### Property 6: 状态变更不影响链接

_For any_ valid share link, changing the parrot's status to "sold" or "returned" SHALL NOT invalidate the link; the link SHALL remain accessible and return the current parrot data.

**Validates: Requirements 3.4**

### Property 7: 链接列表完整性

_For any_ parrot with share links, querying the link list SHALL return all active, non-expired links with their created_at and remaining validity period.

**Validates: Requirements 4.1, 4.4**

### Property 8: 链接删除有效性

_For any_ share link, after deletion, accessing the link SHALL return an "invalid" status.

**Validates: Requirements 4.3**

## Error Handling

### API 错误响应

| 场景         | HTTP 状态码 | 错误消息                                 |
| ------------ | ----------- | ---------------------------------------- |
| 鹦鹉不存在   | 404         | "未找到 ID 为 {id} 的鹦鹉"               |
| Token 不存在 | 404         | "链接无效"                               |
| Token 已过期 | 200         | status: "expired", message: "链接已过期" |
| Token 已删除 | 200         | status: "invalid", message: "链接已失效" |
| 数据库错误   | 500         | "服务器内部错误"                         |

### 前端错误处理

- 生成链接失败：显示错误提示，允许重试
- 复制到剪贴板失败：显示链接文本，提示手动复制
- 分享页面加载失败：显示友好的错误页面

## Testing Strategy

### 单元测试

使用 pytest 进行后端单元测试：

1. **Token 生成测试**

   - 验证 token 长度 >= 16
   - 验证 token URL 安全
   - 验证 token 唯一性

2. **API 端点测试**

   - 生成链接成功/失败场景
   - 访问有效/过期/无效链接
   - 删除链接功能

3. **数据模型测试**
   - ShareLink 模型 CRUD 操作
   - 外键关联正确性

### 属性测试

使用 hypothesis 进行属性测试：

1. **Property 1 & 2**: 生成多个链接，验证完整性和唯一性
2. **Property 3**: 为同一 parrot 生成多个链接，验证独立性
3. **Property 4**: 随机生成 parrot 数据，验证返回完整性
4. **Property 5**: 验证有效期计算正确
5. **Property 6**: 改变 parrot 状态，验证链接仍可访问
6. **Property 7**: 创建多个链接，验证列表返回完整
7. **Property 8**: 删除链接后验证不可访问

### 前端测试

使用 Vitest + React Testing Library：

1. 分享按钮点击生成链接
2. 链接复制到剪贴板
3. 分享页面正确渲染
4. 错误状态正确显示

### 测试配置

```python
# pytest配置
# 每个属性测试运行100次迭代
@settings(max_examples=100)
@given(...)
def test_property_xxx():
    pass
```
