# 鹦鹉管理系统 - 产品需求文档

## 🎯 项目背景

### 业务痛点

1. **鹦鹉信息管理困难**：品种、年龄、公母、价格、圈号等数据散落在各处
2. **照片管理混乱**：客户需要照片时临时拍摄，无法快速提供
3. **销售状态不清晰**：无法快速了解哪些鹦鹉已售/未售
4. **退货管理缺失**：退回后重新上架流程不规范
5. **分类管理低效**：按品种和年龄分类困难

## 👥 目标用户

- **主要用户**：鹦鹉养殖户、销售商
- **使用场景**：养殖场现场管理、门店销售、客户对接

---

## 📋 核心功能模块

### 模块 1：鹦鹉信息管理（核心）

**功能描述**：

- 录入和编辑鹦鹉基本信息
- 支持多照片上传和管理
- 记录圈号位置
- 管理销售状态

### 模块 2：销售管理

**功能描述**：

- 销售订单管理
- 销售状态跟踪（未售/已售）
- 销售价格记录
- 客户信息关联

### 模块 3：退货管理

**功能描述**：

- 退货登记
- 鹦鹉重新上架
- 退货原因记录
- 退货后状态恢复

### 模块 4：分类与筛选

**功能描述**：

- 按品种分类管理
- 按年龄区间筛选
- 按销售状态筛选
- 高级搜索功能

### 模块 5：客户接口

**功能描述**：

- 快速生成带照片的商品清单
- 客户咨询响应
- 销售记录追踪

### 模块 6：系统管理

**功能描述**：

- 用户权限管理
- 数据备份恢复
- 基础数据配置（品种、圈号等）

---

## 📖 用户故事（User Stories）

### US-001：作为养殖户，我需要录入鹦鹉信息

```
故事描述：
当新鹦鹉到货时，我希望能够快速录入：
- 品种（如：葵花鹦鹉、金刚鹦鹉、虎皮鹦鹉等）
- 出生日期/年龄
- 公母
- 初始价格
- 照片（多张）
- 所在圈号

验收标准：
✓ 可以一次性上传多张照片
✓ 自动保存且可以后续编辑
✓ 生成唯一的鹦鹉ID
```

### US-002：作为销售商，我需要快速查看库存

```
故事描述：
当有客户咨询时，我希望能够：
- 筛选出所有"未售"状态的鹦鹉
- 按品种快速查找
- 在手机上也能操作

验收标准：
✓ 默认只显示未售鹦鹉
✓ 支持品种快速筛选
✓ 移动端适配良好
```

### US-003：作为销售人员，我需要快速提供照片

```
故事描述：
当客户要求看鹦鹉照片时，我希望：
- 在鹦鹉列表页能直接预览照片
- 能够一键生成照片清单发给客户
- 支持按品种批量导出照片

验收标准：
✓ 列表页显示缩略图
✓ 支持生成带照片的商品清单PDF/图片
✓ 可通过微信等分享
```

### US-004：作为管理员，我需要处理退货

```
故事描述：
当客户退货时，我需要：
- 记录退货鹦鹉的信息
- 将状态改回"未售"
- 记录退货原因和时间
- 可能需要调整价格后重新上架

验收标准：
✓ 退货操作简单快捷
✓ 历史销售记录保留
✓ 重新上架流程流畅
```

### US-005：作为管理者，我需要按年龄管理鹦鹉

```
故事描述：
为了更好地管理库存，我需要：
- 自动计算鹦鹉年龄（按天/月）
- 按年龄段筛选（雏鸟、亚成体、成鸟）
- 查看各年龄段库存数量

验收标准：
✓ 自动计算并显示年龄
✓ 支持按年龄区间筛选
✓ 显示库存统计
```

### US-006：作为销售员，我需要了解每日销售情况

```
故事描述：
每天结束时，我希望：
- 查看当天销售了多少只鹦鹉
- 查看销售额统计
- 了解哪些品种卖得好

验收标准：
✓ 按日期筛选销售记录
✓ 显示销售数量和总额
✓ 支持按品种统计
```

### US-007：作为仓库管理员，我需要管理圈号

```
故事描述：
我需要记录：
- 每只鹦鹉所在的圈号
- 按圈号查看鹦鹉
- 圈号的位置调整记录

验收标准：
✓ 支持圈号快速录入
✓ 支持按圈号筛选
✓ 圈号调整有历史记录
```

### US-008：作为老板，我需要数据概览

```
故事描述：
我希望在仪表板上看到：
- 总库存数量
- 各品种的库存分布
- 销售额趋势
- 滞销鹦鹉提醒

验收标准：
✓ 实时更新的数据概览
✓ 图表展示库存分布
✓ 自定义时间段的销售统计
```

---

## 🎖️ MVP 功能优先级（MoSCoW 方法）

### 🔥 P0 - Must Have（核心功能，必须实现）

1. **鹦鹉信息录入**

   - 基本信息字段：品种、出生日期、公母、价格、圈号
   - 单张照片上传
   - 保存到数据库

2. **鹦鹉列表查看**

   - 显示所有鹦鹉卡片
   - 显示缩略图
   - 显示基本信息

3. **销售状态管理**

   - 标记为"已售"或"未售"
   - 已售鹦鹉在列表中特殊标记

4. **筛选功能**
   - 按品种筛选
   - 按销售状态筛选
   - 按年龄区间筛选

### ⚡ P1 - Should Have（重要功能，快速迭代加入）

5. **多照片管理**
   - 支持上传多张照片
   - 照片轮播查看
6. **退货处理**
   - 将已售鹦鹉状态改回未售
7. **客户清单导出**
   - 生成带照片的商品清单
8. **年龄自动计算**
   - 根据出生日期计算年龄（月龄）

### ⭐ P2 - Could Have（增值功能，后期加入）

9. **销售记录管理**
   - 记录销售信息（客户、价格、日期）
10. **库存统计报表**
    - 各品种库存数量
    - 销售额统计
11. **圈号管理优化**
    - 圈号地图或位置标记
12. **移动端适配优化**

### 🌟 P3 - Won't Have（暂不考虑）

13. 多用户权限系统
14. 在线支付集成
15. 客户管理系统
16. 繁殖配对管理
17. 健康记录管理

---

## 🗄️ 数据库表设计建议

### 1. 鹦鹉表（parrots）

```sql
CREATE TABLE parrots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    -- 基本信息
    breed VARCHAR(50) NOT NULL COMMENT '品种',
    gender ENUM('公', '母', '未知') NOT NULL DEFAULT '未知' COMMENT '公母',
    birth_date DATE COMMENT '出生日期',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    cage_number VARCHAR(20) COMMENT '圈号',

    -- 状态管理
    status ENUM('未售', '已售') NOT NULL DEFAULT '未售' COMMENT '销售状态',

    -- 描述信息
    description TEXT COMMENT '其他描述',

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 索引
    INDEX idx_status (status),
    INDEX idx_breed (breed),
    INDEX idx_cage (cage_number)
);
```

### 2. 鹦鹉照片表（parrot_photos）

```sql
CREATE TABLE parrot_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parrot_id INT NOT NULL COMMENT '鹦鹉ID',
    photo_url VARCHAR(255) NOT NULL COMMENT '照片URL',
    is_primary BOOLEAN DEFAULT FALSE COMMENT '是否为主照片',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parrot_id) REFERENCES parrots(id) ON DELETE CASCADE,
    INDEX idx_parrot (parrot_id)
);
```

### 3. 销售记录表（sales）

```sql
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parrot_id INT NOT NULL COMMENT '鹦鹉ID',

    -- 销售信息
    sale_price DECIMAL(10, 2) NOT NULL COMMENT '实际销售价格',
    sale_date DATE NOT NULL COMMENT '销售日期',

    -- 客户信息（简单记录）
    customer_name VARCHAR(100) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',

    -- 状态
    status ENUM('正常', '退货') DEFAULT '正常' COMMENT '销售状态',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parrot_id) REFERENCES parrots(id) ON DELETE CASCADE,
    INDEX idx_sale_date (sale_date),
    INDEX idx_status (status)
);
```

### 4. 退货记录表（returns）

```sql
CREATE TABLE returns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL COMMENT '销售记录ID',
    parrot_id INT NOT NULL COMMENT '鹦鹉ID',

    return_date DATE NOT NULL COMMENT '退货日期',
    return_reason TEXT COMMENT '退货原因',
    note TEXT COMMENT '备注',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (parrot_id) REFERENCES parrots(id) ON DELETE CASCADE
);
```

### 5. 品种字典表（breeds）

```sql
CREATE TABLE breeds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '品种名称',
    description TEXT COMMENT '品种描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 用户操作流程

### 流程 1：新增鹦鹉入库

```
开始
  ↓
点击"新增鹦鹉"按钮
  ↓
填写基本信息：
  - 选择品种（必填）
  - 选择公母（必填）
  - 输入出生日期（选填）
  - 输入价格（必填）
  - 输入圈号（选填）
  - 上传照片（至少1张）
  ↓
点击"保存"
  ↓
提示"保存成功"
  ↓
在鹦鹉列表中看到新增的鹦鹉
```

### 流程 2：向客户展示鹦鹉

```
开始
  ↓
进入鹦鹉列表
  ↓
筛选条件：
  - 状态=未售（默认）
  - 选择客户感兴趣的品种
  - 选择年龄区间（可选）
  ↓
浏览筛选结果
  ↓
点击鹦鹉查看详细信息
  ↓
查看多张照片轮播
  ↓
生成客户清单（可选）
  ↓
通过微信等方式发送给客户
```

### 流程 3：鹦鹉销售

```
开始
  ↓
找到客户选中的鹦鹉
  ↓
点击"标记已售"按钮
  ↓
填写销售信息：
  - 实际销售价格
  - 客户姓名（选填）
  - 客户电话（选填）
  ↓
确认销售
  ↓
鹦鹉状态变为"已售"
  ↓
在已售列表中可以查看
```

### 流程 4：处理退货

```
开始
  ↓
在"已售鹦鹉"中找到退货的鹦鹉
  ↓
点击"退货"按钮
  ↓
填写退货信息：
  - 退货日期（默认今天）
  - 退货原因（选填）
  - 备注（选填）
  ↓
确认退货
  ↓
鹦鹉状态自动变为"未售"
  ↓
可根据需要调整价格
  ↓
更新圈号等信息
  ↓
保存后重新展示在库存中
```

### 流程 5：查看库存统计

```
开始
  ↓
进入"统计"页面
  ↓
查看：
  - 总库存数量
  - 各品种分布图
  - 年龄分布
  ↓
点击特定品种
  ↓
查看该品种下所有鹦鹉
```

---

## 🛠️ 技术栈建议

### 前端

- **Web 框架**：React/Vue + TypeScript
- **UI 组件**：Ant Design / Element UI
- **图表**：ECharts / Chart.js
- **移动端**：PWA 方案或响应式设计

### 后端

- **语言**：Python 或 Node.js
- **框架**：FastAPI（Python）或 Express（Node.js）
- **数据库**：SQLite（轻量）或 MySQL（正式环境）
- **文件存储**：本地存储或云端存储

### 部署

- **服务器**：轻量级应用，可以部署在云服务器
- **数据备份**：定期备份数据库和照片

---

## 📊 成功指标

### 功能使用指标

- [ ] 日均新增鹦鹉数量
- [ ] 照片上传成功率
- [ ] 销售记录完整性

### 业务效率指标

- [ ] 客户响应时间缩短 50%
- [ ] 库存盘点时间缩短 70%
- [ ] 退货处理错误率降低 90%

### 用户满意度

- [ ] 5 分钟内能响应客户照片需求
- [ ] 不通过记忆能准确回答库存情况
- [ ] 不再担心丢失销售记录

---

## 🚀 实现路线图

### 第一阶段（1-2 周）：MVP 核心版本

- [ ] 鹦鹉信息录入功能
- [ ] 鹦鹉列表展示（带搜索筛选）
- [ ] 状态标记功能（已售/未售）
- [ ] 基础数据存储

### 第二阶段（3-4 周）：便利性提升

- [ ] 多照片上传
- [ ] 按品种/年龄/状态筛选
- [ ] 退货功能
- [ ] 销售记录管理

### 第三阶段（5-6 周）：智能化增强

- [ ] 年龄自动计算
- [ ] 库存统计报表
- [ ] 客户清单导出
- [ ] 移动端优化

### 第四阶段（7-8 周）：系统完善

- [ ] 仪表板数据概览
- [ ] 圈号管理优化
- [ ] 数据备份机制
- [ ] 用户反馈优化

---

## 📝 附件

- 原型设计文件（待制作）
- 技术架构图（待制作）
- UI 设计稿（待制作）
