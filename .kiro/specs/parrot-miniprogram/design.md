# Design Document: 鹦鹉管理小程序

## Overview

本设计文档描述微信小程序版鹦鹉管理系统的技术架构和实现方案。小程序将复用现有 FastAPI 后端，采用原生微信小程序框架开发，实现与 Web 版功能完全一致的移动端应用。

## Architecture

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    微信小程序客户端                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │  首页   │  │ 鹦鹉管理 │  │ 销售管理 │  │  我的   │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       └────────────┴────────────┴────────────┘          │
│                         │                               │
│              ┌──────────┴──────────┐                   │
│              │    API Service      │                   │
│              │  (请求封装/错误处理)  │                   │
│              └──────────┬──────────┘                   │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────┐
│                    现有后端服务                          │
│              ┌──────────┴──────────┐                   │
│              │   FastAPI Backend   │                   │
│              │   (已有API接口)      │                   │
│              └──────────┬──────────┘                   │
│                         │                               │
│              ┌──────────┴──────────┐                   │
│              │  SQLite/MySQL DB    │                   │
│              └─────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### 技术选型

| 层级     | 技术方案                     | 说明                     |
| -------- | ---------------------------- | ------------------------ |
| 前端框架 | 微信小程序原生               | 官方框架，性能最优       |
| UI 组件  | Vant Weapp                   | 轻量级移动端组件库       |
| 状态管理 | 小程序全局数据 + 页面状态    | 简单场景无需复杂状态管理 |
| 网络请求 | wx.request 封装              | 统一错误处理和 loading   |
| 图表库   | wx-charts / ECharts 小程序版 | 数据可视化               |
| 后端     | 现有 FastAPI                 | 完全复用                 |
| 数据库   | 现有 SQLite/MySQL            | 完全复用                 |

## Components and Interfaces

### 目录结构

```
miniprogram/
├── app.js                 # 小程序入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── pages/
│   ├── index/             # 首页仪表盘
│   ├── parrot/
│   │   ├── list/          # 鹦鹉列表
│   │   ├── detail/        # 鹦鹉详情
│   │   ├── add/           # 添加鹦鹉
│   │   └── edit/          # 编辑鹦鹉
│   ├── sales/
│   │   ├── list/          # 销售记录
│   │   └── sell/          # 销售表单
│   ├── breeding/
│   │   ├── list/          # 种鸟列表
│   │   └── pair/          # 配对管理
│   ├── incubation/
│   │   ├── list/          # 孵化列表
│   │   └── add/           # 添加孵化记录
│   ├── share/             # 分享页面
│   └── profile/           # 我的页面
├── components/
│   ├── parrot-card/       # 鹦鹉卡片组件
│   ├── stat-card/         # 统计卡片组件
│   ├── filter-bar/        # 筛选栏组件
│   ├── timeline/          # 时间线组件
│   ├── photo-uploader/    # 照片上传组件
│   └── empty-state/       # 空状态组件
├── services/
│   ├── api.js             # API请求封装
│   ├── parrot.js          # 鹦鹉相关API
│   ├── sales.js           # 销售相关API
│   ├── incubation.js      # 孵化相关API
│   └── statistics.js      # 统计相关API
├── utils/
│   ├── request.js         # 网络请求工具
│   ├── date.js            # 日期处理工具
│   ├── storage.js         # 本地存储工具
│   └── constants.js       # 常量定义
└── styles/
    ├── variables.wxss     # 样式变量
    └── common.wxss        # 公共样式
```

### 核心组件接口

#### 1. API Service (services/api.js)

```javascript
// 基础请求配置
const BASE_URL = "https://your-api-domain.com/api";

// 统一请求方法
function request(options) {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: "加载中" });
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header: { "Content-Type": "application/json" },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      },
    });
  });
}

// API方法
const api = {
  // 鹦鹉管理
  getParrots: (params) => request({ url: "/parrots", data: params }),
  getParrot: (id) => request({ url: `/parrots/${id}` }),
  createParrot: (data) => request({ url: "/parrots", method: "POST", data }),
  updateParrot: (id, data) =>
    request({ url: `/parrots/${id}`, method: "PUT", data }),
  deleteParrot: (id) => request({ url: `/parrots/${id}`, method: "DELETE" }),

  // 销售管理
  getSalesRecords: (params) => request({ url: "/sales-records", data: params }),
  updateSaleInfo: (id, data) =>
    request({ url: `/parrots/${id}/sale-info`, method: "PUT", data }),
  returnParrot: (id, data) =>
    request({ url: `/parrots/${id}/return`, method: "PUT", data }),

  // 回访管理
  createFollowUp: (id, data) =>
    request({ url: `/parrots/${id}/follow-ups`, method: "POST", data }),
  getFollowUps: (id) => request({ url: `/parrots/${id}/follow-ups` }),

  // 配对管理
  pairParrots: (data) =>
    request({ url: "/parrots/pair", method: "POST", data }),
  unpairParrot: (id) =>
    request({ url: `/parrots/unpair/${id}`, method: "POST" }),
  getEligibleFemales: (maleId) =>
    request({ url: `/parrots/eligible-females/${maleId}` }),

  // 孵化管理
  getIncubationRecords: (params) =>
    request({ url: "/incubation", data: params }),
  createIncubation: (data) =>
    request({ url: "/incubation", method: "POST", data }),
  updateIncubation: (id, data) =>
    request({ url: `/incubation/${id}`, method: "PUT", data }),

  // 统计
  getStatistics: () => request({ url: "/statistics" }),
  getMonthlySales: () => request({ url: "/statistics/monthly-sales" }),

  // 照片
  getPhotos: (id) => request({ url: `/parrots/${id}/photos` }),

  // 分享
  createShareLink: (id, data) =>
    request({ url: `/share/parrots/${id}`, method: "POST", data }),
  getShareInfo: (token) => request({ url: `/share/${token}` }),
};
```

#### 2. Parrot Card Component (components/parrot-card)

```javascript
// parrot-card.js
Component({
  properties: {
    parrot: { type: Object, value: {} },
    showActions: { type: Boolean, value: true },
  },
  methods: {
    onTap() {
      this.triggerEvent("tap", { parrot: this.data.parrot });
    },
    onAction(e) {
      const action = e.currentTarget.dataset.action;
      this.triggerEvent("action", { action, parrot: this.data.parrot });
    },
  },
});
```

#### 3. Filter Bar Component (components/filter-bar)

```javascript
// filter-bar.js
Component({
  properties: {
    breeds: { type: Array, value: [] },
    filters: { type: Object, value: {} },
  },
  methods: {
    onFilterChange(e) {
      const { field, value } = e.currentTarget.dataset;
      this.triggerEvent("change", { field, value });
    },
    onSearch(e) {
      this.triggerEvent("search", { keyword: e.detail.value });
    },
    onReset() {
      this.triggerEvent("reset");
    },
  },
});
```

## Data Models

### 复用现有后端数据模型

小程序直接使用现有后端的数据结构，主要模型如下：

#### Parrot (鹦鹉)

```typescript
interface Parrot {
  id: number;
  breed: string; // 品种
  gender: "公" | "母" | "未验卡";
  birth_date: string | null; // 出生日期
  ring_number: string | null; // 圈号
  price: number | null; // 价格
  min_price: number | null; // 最低价
  max_price: number | null; // 最高价
  status:
    | "available"
    | "sold"
    | "returned"
    | "breeding"
    | "paired"
    | "incubating";
  health_notes: string | null;
  mate_id: number | null; // 配偶ID
  paired_at: string | null; // 配对时间
  sold_at: string | null; // 销售时间
  returned_at: string | null; // 退货时间
  return_reason: string | null;
  photo_count: number;
  created_at: string;
  updated_at: string;
}
```

#### SaleInfo (销售信息)

```typescript
interface SaleInfo {
  seller: string; // 售卖人
  buyer_name: string; // 购买者
  sale_price: number; // 销售价格
  contact: string; // 联系方式
  follow_up_status: "pending" | "completed" | "no_contact";
  notes: string | null;
}
```

#### IncubationRecord (孵化记录)

```typescript
interface IncubationRecord {
  id: number;
  father_id: number | null;
  mother_id: number | null;
  start_date: string;
  expected_hatch_date: string;
  actual_hatch_date: string | null;
  eggs_count: number;
  hatched_count: number;
  status: "incubating" | "hatched" | "failed";
  notes: string | null;
}
```

#### Statistics (统计数据)

```typescript
interface Statistics {
  total_parrots: number;
  available_parrots: number;
  sold_parrots: number;
  returned_parrots: number;
  breed_counts: Record<string, number>;
  total_revenue: number;
}
```

### 本地存储结构

```javascript
// 缓存键定义
const STORAGE_KEYS = {
  BREEDS: "breeds_cache", // 品种列表缓存
  STATISTICS: "statistics_cache", // 统计数据缓存
  LAST_SYNC: "last_sync_time", // 最后同步时间
};

// 缓存有效期：5分钟
const CACHE_DURATION = 5 * 60 * 1000;
```

## UI Design

### 设计风格：清新自然 + 毛玻璃质感

采用 2024 年流行的设计趋势，融合清新自然风格与现代毛玻璃（Glassmorphism）效果，打造独特的视觉体验。

### 设计灵感

参考优秀小程序设计：

- 小红书：卡片瀑布流、圆润设计
- 得物：渐变色彩、精致卡片
- 飞书：简洁高效、信息层次清晰
- 微信读书：沉浸式阅读体验

### 色彩系统

```css
/* 主色调 - 清新自然系 */
--primary-gradient: linear-gradient(
  135deg,
  #667eea 0%,
  #764ba2 100%
); /* 梦幻紫渐变 */
--primary-color: #667eea; /* 主色：薰衣草紫 */
--primary-light: #818cf8; /* 浅紫 */
--primary-dark: #4f46e5; /* 深紫 */

/* 辅助色 - 活力点缀 */
--accent-coral: #ff6b6b; /* 珊瑚红 - 用于重要操作 */
--accent-mint: #4ecdc4; /* 薄荷绿 - 用于成功状态 */
--accent-amber: #ffb347; /* 琥珀橙 - 用于警告 */
--accent-sky: #74b9ff; /* 天空蓝 - 用于信息 */

/* 背景色 - 柔和层次 */
--bg-primary: #f8fafc; /* 主背景：极浅灰蓝 */
--bg-secondary: #f1f5f9; /* 次背景 */
--bg-card: rgba(255, 255, 255, 0.8); /* 毛玻璃卡片 */
--bg-glass: rgba(255, 255, 255, 0.6); /* 毛玻璃效果 */

/* 文字色 */
--text-primary: #1e293b; /* 主文字：深蓝灰 */
--text-secondary: #64748b; /* 次要文字 */
--text-hint: #94a3b8; /* 提示文字 */
--text-white: #ffffff; /* 白色文字 */

/* 状态色 - 柔和渐变 */
--status-available: linear-gradient(
  135deg,
  #4ecdc4 0%,
  #44a08d 100%
); /* 待售：薄荷渐变 */
--status-sold: linear-gradient(
  135deg,
  #ff6b6b 0%,
  #ee5a5a 100%
); /* 已售：珊瑚渐变 */
--status-breeding: linear-gradient(
  135deg,
  #ffb347 0%,
  #ffcc33 100%
); /* 种鸟：琥珀渐变 */
--status-paired: linear-gradient(
  135deg,
  #74b9ff 0%,
  #5b9bd5 100%
); /* 配对：天空渐变 */
--status-incubating: linear-gradient(
  135deg,
  #a78bfa 0%,
  #8b5cf6 100%
); /* 孵化：紫罗兰渐变 */

/* 阴影系统 */
--shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
--shadow-md: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
--shadow-lg: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
--shadow-glow: 0 0 40rpx rgba(102, 126, 234, 0.3); /* 发光效果 */
```

### 间距系统

```css
--spacing-xs: 8rpx;
--spacing-sm: 16rpx;
--spacing-md: 24rpx;
--spacing-lg: 32rpx;
--spacing-xl: 48rpx;
--spacing-2xl: 64rpx;
```

### 圆角系统

```css
--radius-sm: 12rpx;
--radius-md: 20rpx;
--radius-lg: 32rpx;
--radius-xl: 48rpx;
--radius-full: 9999rpx;
```

### 毛玻璃效果

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### 页面布局

#### TabBar 配置 - 悬浮式设计

```json
{
  "tabBar": {
    "custom": true,
    "color": "#94A3B8",
    "selectedColor": "#667eea",
    "backgroundColor": "rgba(255, 255, 255, 0.9)",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "icons/home.png",
        "selectedIconPath": "icons/home-active.png"
      },
      {
        "pagePath": "pages/parrot/list/index",
        "text": "鹦鹉",
        "iconPath": "icons/bird.png",
        "selectedIconPath": "icons/bird-active.png"
      },
      {
        "pagePath": "pages/sales/list/index",
        "text": "销售",
        "iconPath": "icons/chart.png",
        "selectedIconPath": "icons/chart-active.png"
      },
      {
        "pagePath": "pages/profile/index",
        "text": "我的",
        "iconPath": "icons/user.png",
        "selectedIconPath": "icons/user-active.png"
      }
    ]
  }
}
```

自定义 TabBar 样式：悬浮胶囊式，底部留白，圆角设计，带微弱阴影。

### 核心页面设计

#### 1. 首页仪表盘 - 沉浸式数据展示

**顶部区域：**

- 渐变背景头部（紫色渐变）
- 大字体显示总销售额
- 环比增长动画指示器

**统计卡片区：**

- 四个毛玻璃卡片横向滚动
- 每个卡片带有渐变图标背景
- 数字使用大号字体，带计数动画

**图表区域：**

- 圆角卡片包裹
- 渐变色折线图/柱状图
- 支持手势缩放和滑动

**品种分布：**

- 彩色标签云展示
- 点击可快速筛选

#### 2. 鹦鹉列表页 - 瀑布流卡片

**搜索区：**

- 毛玻璃搜索框，带语音搜索图标
- 筛选按钮带数字角标（显示已选筛选数）

**筛选抽屉：**

- 底部弹出式抽屉
- 标签式多选（品种、性别、状态）
- 价格区间滑块

**列表区：**

- 双列瀑布流布局
- 卡片带圆角和阴影
- 照片占卡片 60%高度
- 状态标签使用渐变色胶囊
- 下拉刷新带弹性动画

**悬浮按钮：**

- 右下角渐变色圆形按钮
- 带脉冲动画效果
- 点击展开多个快捷操作

#### 3. 鹦鹉详情页 - 沉浸式体验

**照片区：**

- 全宽照片轮播，支持手势缩放
- 视频自动播放（静音）
- 底部渐变遮罩显示基本信息

**信息卡片：**

- 毛玻璃效果卡片
- 图标+文字的信息行
- 价格使用大号渐变色字体

**时间线：**

- 左侧彩色圆点连线
- 每个节点带图标和时间
- 展开/收起动画

**操作栏：**

- 底部固定操作栏
- 主操作使用渐变按钮
- 次要操作使用描边按钮

#### 4. 销售记录页 - 清晰高效

**顶部统计：**

- 横向滚动的统计卡片
- 本月销售额、销售数、退货率

**列表：**

- 卡片式列表，每卡片显示：
  - 左侧：鹦鹉缩略图
  - 中间：品种、圈号、客户名
  - 右侧：价格、回访状态标签
- 左滑显示操作按钮（回访、退货）

**空状态：**

- 可爱的插画
- 引导文案

### 动效设计

```css
/* 页面转场 */
.page-enter {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 卡片点击反馈 */
.card-tap {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* 数字计数动画 */
.count-up {
  animation: countUp 0.8s ease-out;
}

/* 加载骨架屏 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 图标设计

使用线性图标风格，2px 描边，圆角端点，与整体设计风格统一。推荐使用：

- Remix Icon
- Feather Icons
- 或自定义 SVG 图标

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: 搜索结果匹配性

_For any_ 搜索关键词和鹦鹉数据集，搜索返回的所有结果都应该在品种或圈号字段中包含该关键词（不区分大小写）。

**Validates: Requirements 2.2, 5.4**

### Property 2: 筛选结果一致性

_For any_ 筛选条件组合（品种、性别、状态、价格区间），返回的所有鹦鹉都应该满足所有指定的筛选条件。

**Validates: Requirements 2.3**

### Property 3: 分页数据完整性

_For any_ 鹦鹉列表分页请求，返回的数据量不应超过请求的 pageSize，且所有页面的数据合并后应该等于总数据集（无重复、无遗漏）。

**Validates: Requirements 2.1**

### Property 4: 表单必填字段验证

_For any_ 鹦鹉表单提交，如果品种或性别字段为空，验证应该失败并返回相应错误信息。

**Validates: Requirements 3.4, 4.2**

### Property 5: 鹦鹉创建 round-trip

_For any_ 有效的鹦鹉数据，创建鹦鹉后通过 ID 查询应该返回相同的数据（除了系统生成的字段如 id、created_at）。

**Validates: Requirements 4.3**

### Property 6: 销售状态转换

_For any_ 状态为 available 的鹦鹉，执行销售操作后状态应该变为 sold，且销售信息应该被正确保存。

**Validates: Requirements 5.2**

### Property 7: 退货状态转换与历史记录

_For any_ 状态为 sold 的鹦鹉，执行退货操作后：

1. 鹦鹉状态应该变为 available
2. 销售历史表中应该有一条对应的退货记录
3. 销售时间线应该包含退货事件

**Validates: Requirements 6.2, 6.3**

### Property 8: 回访状态有效性

_For any_ 回访操作，回访状态只能是以下三种之一：pending、completed、no_contact。

**Validates: Requirements 7.2**

### Property 9: 回访记录创建

_For any_ 回访操作，执行后应该创建一条回访记录，且鹦鹉的 follow_up_status 应该更新为提交的状态。

**Validates: Requirements 7.3**

### Property 10: 种鸟状态转换

_For any_ 状态为 available 且性别不为"未验卡"的鹦鹉，设为种鸟后状态应该变为 breeding。

**Validates: Requirements 8.1**

### Property 11: 可配对列表正确性

_For any_ 公鸟查询可配对母鸟，返回的列表中所有鹦鹉都应该满足：性别为"母"、状态为 breeding、mate_id 为 null。

**Validates: Requirements 8.2**

### Property 12: 配对关系一致性

_For any_ 配对操作，执行后双方的 mate_id 应该互相指向对方，且双方状态都应该变为 paired。

**Validates: Requirements 8.3**

### Property 13: 取消配对 round-trip

_For any_ 已配对的鹦鹉对，取消配对后双方的 mate_id 应该为 null，状态应该恢复为 breeding。

**Validates: Requirements 8.4**

### Property 14: 孵化记录创建影响

_For any_ 孵化记录创建操作，父母鸟的状态都应该变为 incubating。

**Validates: Requirements 9.4**

### Property 15: 退货率计算正确性

_For any_ 统计数据，退货率应该等于退货数量除以总销售数量（包括已退货的）。

**Validates: Requirements 11.4**

### Property 16: 缓存一致性

_For any_ 数据存入缓存后，在缓存有效期内读取应该返回相同的数据。

**Validates: Requirements 12.3**

## Error Handling

### 网络错误处理

```javascript
// utils/request.js
function handleError(error) {
  if (error.errMsg && error.errMsg.includes("timeout")) {
    wx.showToast({ title: "请求超时，请重试", icon: "none" });
  } else if (error.errMsg && error.errMsg.includes("fail")) {
    wx.showToast({ title: "网络连接失败", icon: "none" });
  } else if (error.statusCode === 404) {
    wx.showToast({ title: "数据不存在", icon: "none" });
  } else if (error.statusCode === 400) {
    wx.showToast({ title: error.data?.detail || "请求参数错误", icon: "none" });
  } else if (error.statusCode >= 500) {
    wx.showToast({ title: "服务器错误，请稍后重试", icon: "none" });
  } else {
    wx.showToast({ title: "操作失败", icon: "none" });
  }
}
```

### 表单验证错误

```javascript
// 统一的表单验证错误处理
function validateForm(data, rules) {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    if (rule.required && !data[field]) {
      errors.push({ field, message: `${rule.label}不能为空` });
    }
    if (rule.pattern && data[field] && !rule.pattern.test(data[field])) {
      errors.push({ field, message: rule.message });
    }
  }
  return errors;
}
```

### 业务逻辑错误

| 错误场景         | 处理方式                             |
| ---------------- | ------------------------------------ |
| 圈号重复         | 显示"圈号已存在"提示，阻止保存       |
| 未验卡设种鸟     | 显示"未验卡的鹦鹉不能设为种鸟"提示   |
| 非待售鹦鹉售出   | 显示"只有待售状态的鹦鹉才能售出"提示 |
| 非已售鹦鹉退货   | 显示"只有已售状态的鹦鹉才能退货"提示 |
| 已配对鹦鹉再配对 | 显示"该鹦鹉已配对"提示               |

## Testing Strategy

### 测试框架选择

- **单元测试**: Jest + miniprogram-simulate
- **属性测试**: fast-check
- **E2E 测试**: miniprogram-automator

### 单元测试

单元测试用于验证具体示例和边界条件：

1. **API Service 测试**

   - 测试请求参数正确构建
   - 测试响应数据正确解析
   - 测试错误处理逻辑

2. **工具函数测试**

   - 日期计算函数
   - 价格格式化函数
   - 缓存读写函数

3. **组件测试**
   - 组件渲染正确性
   - 事件触发正确性
   - 属性变化响应

### 属性测试

属性测试用于验证通用属性在所有输入下都成立：

```javascript
// 使用fast-check进行属性测试
const fc = require("fast-check");

// Property 1: 搜索结果匹配性
test("搜索结果都应包含搜索关键词", () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }), // 搜索关键词
      fc.array(parrotArbitrary), // 鹦鹉数据集
      (keyword, parrots) => {
        const results = searchParrots(parrots, keyword);
        return results.every(
          (p) =>
            p.breed.toLowerCase().includes(keyword.toLowerCase()) ||
            (p.ring_number &&
              p.ring_number.toLowerCase().includes(keyword.toLowerCase()))
        );
      }
    ),
    { numRuns: 100 }
  );
});

// Property 2: 筛选结果一致性
test("筛选结果都应满足筛选条件", () => {
  fc.assert(
    fc.property(
      filterArbitrary, // 筛选条件
      fc.array(parrotArbitrary), // 鹦鹉数据集
      (filters, parrots) => {
        const results = filterParrots(parrots, filters);
        return results.every((p) => matchesFilters(p, filters));
      }
    ),
    { numRuns: 100 }
  );
});

// Property 5: 创建round-trip
test("创建鹦鹉后查询应返回相同数据", () => {
  fc.assert(
    fc.property(validParrotArbitrary, async (parrotData) => {
      const created = await api.createParrot(parrotData);
      const fetched = await api.getParrot(created.id);
      return (
        fetched.breed === parrotData.breed &&
        fetched.gender === parrotData.gender &&
        fetched.ring_number === parrotData.ring_number
      );
    }),
    { numRuns: 100 }
  );
});
```

### 测试配置

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["**/*.test.js", "**/*.property.test.js"],
  collectCoverageFrom: [
    "services/**/*.js",
    "utils/**/*.js",
    "components/**/*.js",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

### 测试标注格式

每个属性测试必须标注对应的设计属性：

```javascript
/**
 * Feature: parrot-miniprogram, Property 1: 搜索结果匹配性
 * Validates: Requirements 2.2, 5.4
 */
test("搜索结果都应包含搜索关键词", () => {
  // ...
});
```
