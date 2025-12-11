# 鹦鹉管理系统数据库设计

## 数据库表结构

### 1. breeds 品种字典表

用于存储鹦鹉品种信息（可选表，用于品种管理）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(100) | 品种名称 | NOT NULL, UNIQUE |
| description | TEXT | 品种描述 | |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

```sql
CREATE TABLE breeds (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. parrots 鹦鹉基本信息表

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTO_INCREMENT |
| ring_number | VARCHAR(50) | 圈号（唯一标识） | NOT NULL, UNIQUE |
| breed | VARCHAR(100) | 品种 | NOT NULL |
| gender | ENUM | 公母 | NOT NULL (M/F/UNKNOWN) |
| age | INTEGER | 年龄（月） | NOT NULL |
| birth_date | DATE | 出生日期 | |
| price | DECIMAL(10,2) | 价格 | NOT NULL, DEFAULT 0.00 |
| status | ENUM | 销售状态 | NOT NULL (AVAILABLE/SOLD/RETURNED) |
| description | TEXT | 描述 | |
| health_status | VARCHAR(100) | 健康状况 | DEFAULT '健康' |
| weight | DECIMAL(6,2) | 重量（克） | |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE |
| sold_at | DATETIME | 售出时间 | |

```sql
CREATE TABLE parrots (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    ring_number VARCHAR(50) NOT NULL UNIQUE,
    breed VARCHAR(100) NOT NULL,
    gender ENUM('M', 'F', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    age INTEGER NOT NULL,
    birth_date DATE,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('AVAILABLE', 'SOLD', 'RETURNED') NOT NULL DEFAULT 'AVAILABLE',
    description TEXT,
    health_status VARCHAR(100) DEFAULT '健康',
    weight DECIMAL(6,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sold_at DATETIME
);
```

### 3. parrot_photos 照片表

一对多关联parrots表，一个鹦鹉可以有多张照片

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTO_INCREMENT |
| parrot_id | INTEGER | 鹦鹉ID | NOT NULL, FOREIGN KEY |
| filename | VARCHAR(255) | 文件名 | NOT NULL |
| original_filename | VARCHAR(255) | 原始文件名 | NOT NULL |
| file_path | VARCHAR(500) | 文件路径 | NOT NULL |
| file_size | INTEGER | 文件大小（字节） | |
| is_primary | BOOLEAN | 是否主图 | DEFAULT FALSE |
| sort_order | INTEGER | 排序 | DEFAULT 0 |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE parrot_photos (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    parrot_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parrot_id) REFERENCES parrots(id) ON DELETE CASCADE
);
```

**索引：**
```sql
CREATE INDEX idx_parrot_photos_parrot_id ON parrot_photos(parrot_id);
CREATE INDEX idx_parrot_photos_is_primary ON parrot_photos(is_primary);
```

### 4. sales 销售记录表

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTO_INCREMENT |
| parrot_id | INTEGER | 鹦鹉ID | NOT NULL, FOREIGN KEY, UNIQUE |
| customer_name | VARCHAR(100) | 客户姓名 | NOT NULL |
| customer_phone | VARCHAR(20) | 客户电话 | NOT NULL |
| sale_price | DECIMAL(10,2) | 销售价格 | NOT NULL |
| sale_date | DATETIME | 销售日期 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| payment_method | VARCHAR(50) | 支付方式 | |
| notes | TEXT | 备注 | |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    parrot_id INTEGER NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parrot_id) REFERENCES parrots(id) ON DELETE CASCADE
);
```

**索引：**
```sql
CREATE INDEX idx_sales_customer_name ON sales(customer_name);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
```

### 5. returns 退货记录表

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTO_INCREMENT |
| parrot_id | INTEGER | 鹦鹉ID | NOT NULL, FOREIGN KEY |
| sale_id | INTEGER | 销售记录ID | NOT NULL, FOREIGN KEY |
| return_price | DECIMAL(10,2) | 退货价格 | NOT NULL |
| return_date | DATETIME | 退货日期 | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| reason | TEXT | 退货原因 | NOT NULL |
| health_status | VARCHAR(100) | 退货时健康状况 | |
| handling_method | VARCHAR(100) | 处理方式 | |
| notes | TEXT | 备注 | |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE returns (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    parrot_id INTEGER NOT NULL,
    sale_id INTEGER NOT NULL,
    return_price DECIMAL(10,2) NOT NULL,
    return_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT NOT NULL,
    health_status VARCHAR(100),
    handling_method VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parrot_id) REFERENCES parrots(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);
```

**索引：**
```sql
CREATE INDEX idx_returns_parrot_id ON returns(parrot_id);
CREATE INDEX idx_returns_sale_id ON returns(sale_id);
CREATE INDEX idx_returns_return_date ON returns(return_date);
```

## 数据关系

```
parrots (1) ---- (*) parrot_photos
parrots (1) ---- (1) sales
sales (1) ---- (*) returns
breeds (1) ---- (*) parrots (可选)
```

## 状态流转

### 鹦鹉状态流转

```
AVAILABLE（未售） --> SOLD（已售） --> RETURNED（退货）
     ^                                      |
     |______________________________________|
              重新变为可售
```

- AVAILABLE: 可售状态
- SOLD: 已售出
- RETURNED: 已退货

## 数据字典

### gender 性别
- M: 公
- F: 母
- UNKNOWN: 未知

### status 销售状态
- AVAILABLE: 未售/可售
- SOLD: 已售
- RETURNED: 已退货

## 初始化数据

### breeds 品种示例
```sql
INSERT INTO breeds (name, description) VALUES
('虎皮鹦鹉', '常见小型鹦鹉，活泼好动'),
('牡丹鹦鹉', '中型鹦鹉，羽毛华丽'),
('玄凤鹦鹉', '聪明亲人，适合家养'),
('金刚鹦鹉', '大型鹦鹉，寿命较长');
```

## 数据库优化建议

1. **索引优化**
   - 为经常查询的字段添加索引（ring_number, breed, status等）
   - 为外键添加索引

2. **分区建议**
   - 如果数据量大，可以按年份分区sales和returns表

3. **备份策略**
   - 定期备份数据库
   - 照片文件单独备份

4. **性能监控**
   - 监控慢查询
   - 定期检查数据库性能

## 数据库约束和触发器建议

1. **检查约束**
   - 确保价格大于等于0
   - 确保年龄在合理范围内（0-100年）

2. **触发器**
   - 当鹦鹉状态变为SOLD时，自动更新sold_at字段
   - 当鹦鹉状态变为RETURNED时，检查是否已有销售记录
   - 删除鹦鹉时，级联删除相关照片

## 数据完整性

1. **外键约束**
   - 所有外键都设置ON DELETE CASCADE，确保数据一致性
   - 鹦鹉删除时，自动删除相关照片、销售记录和退货记录

2. **唯一约束**
   - ring_number必须唯一（每只鹦鹉的圈号唯一）
   - parrot_id在sales表中唯一（一只鹦鹉只能有一条销售记录）

3. **非空约束**
   - 关键字段设置NOT NULL约束
   - 必填字段包括：ring_number, breed, gender, age, price
