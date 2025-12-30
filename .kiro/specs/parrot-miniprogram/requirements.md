# Requirements Document

## Introduction

将现有的鹦鹉管理系统（Web 版）完整移植到微信小程序平台。小程序将复用现有的 FastAPI 后端和数据库，实现所有核心功能的完美还原，同时采用更现代、美观的移动端 UI 设计。

## Glossary

- **Mini_Program**: 微信小程序客户端应用
- **Backend_API**: 现有的 FastAPI 后端服务
- **Parrot**: 鹦鹉实体，包含品种、性别、价格、状态等信息
- **Sale_Record**: 销售记录，包含售卖人、购买者、价格等信息
- **Incubation_Record**: 孵化记录，包含父母鸟、蛋数、孵化状态等
- **Follow_Up**: 回访记录，用于追踪售后情况
- **Share_Link**: 分享链接，用于生成鹦鹉信息的公开访问链接

## Requirements

### Requirement 1: 首页仪表盘

**User Story:** As a 养殖场管理员, I want 在首页查看关键业务指标, so that 我能快速了解当前经营状况。

#### Acceptance Criteria

1. WHEN 用户打开小程序首页 THEN Mini_Program SHALL 显示总鹦鹉数、在售数量、已售数量、总销售额四个核心指标卡片
2. WHEN 用户查看首页 THEN Mini_Program SHALL 显示月度销售趋势图表（支持销售额和销售量切换）
3. WHEN 用户查看首页 THEN Mini_Program SHALL 显示品种分布统计
4. WHEN 用户点击指标卡片 THEN Mini_Program SHALL 跳转到对应的筛选列表页面

### Requirement 2: 鹦鹉列表管理

**User Story:** As a 养殖场管理员, I want 查看和管理所有鹦鹉信息, so that 我能高效地进行日常管理工作。

#### Acceptance Criteria

1. WHEN 用户进入鹦鹉列表页 THEN Mini_Program SHALL 分页显示所有鹦鹉，包含圈号、品种、性别、价格区间、状态、年龄
2. WHEN 用户输入搜索关键词 THEN Mini_Program SHALL 按品种或圈号进行模糊搜索
3. WHEN 用户选择筛选条件 THEN Mini_Program SHALL 支持按品种、性别、状态、价格区间进行筛选
4. WHEN 用户下拉列表 THEN Mini_Program SHALL 加载更多数据（无限滚动）
5. WHEN 用户点击鹦鹉卡片 THEN Mini_Program SHALL 显示鹦鹉详情页

### Requirement 3: 鹦鹉详情与编辑

**User Story:** As a 养殖场管理员, I want 查看和编辑鹦鹉详细信息, so that 我能维护准确的鹦鹉档案。

#### Acceptance Criteria

1. WHEN 用户查看鹦鹉详情 THEN Mini_Program SHALL 显示完整信息：基本信息、照片/视频、销售历史时间线
2. WHEN 用户编辑鹦鹉信息 THEN Mini_Program SHALL 支持修改品种、性别、出生日期、圈号、价格区间、健康备注
3. WHEN 用户上传照片或视频 THEN Mini_Program SHALL 调用微信媒体 API 上传文件到后端
4. WHEN 用户保存修改 THEN Mini_Program SHALL 验证必填字段并提交到 Backend_API
5. IF 圈号已存在 THEN Mini_Program SHALL 显示错误提示并阻止保存

### Requirement 4: 添加鹦鹉

**User Story:** As a 养殖场管理员, I want 快速录入新鹦鹉信息, so that 我能及时更新库存。

#### Acceptance Criteria

1. WHEN 用户点击添加按钮 THEN Mini_Program SHALL 显示添加鹦鹉表单
2. THE Mini_Program SHALL 要求填写品种（必填）、性别（必填）、出生日期、圈号、价格区间、健康备注
3. WHEN 用户提交表单 THEN Mini_Program SHALL 验证数据并创建新鹦鹉记录
4. WHEN 创建成功 THEN Mini_Program SHALL 返回列表页并显示成功提示

### Requirement 5: 销售管理

**User Story:** As a 养殖场管理员, I want 记录和管理鹦鹉销售信息, so that 我能追踪销售情况和客户信息。

#### Acceptance Criteria

1. WHEN 用户对待售鹦鹉执行"售出"操作 THEN Mini_Program SHALL 显示销售信息表单（售卖人、购买者、价格、联系方式）
2. WHEN 用户提交销售信息 THEN Mini_Program SHALL 更新鹦鹉状态为已售并保存销售记录
3. WHEN 用户查看销售记录列表 THEN Mini_Program SHALL 显示所有已售鹦鹉及其销售信息
4. WHEN 用户搜索销售记录 THEN Mini_Program SHALL 支持按客户姓名、圈号搜索

### Requirement 6: 退货处理

**User Story:** As a 养殖场管理员, I want 处理客户退货, so that 我能正确记录退货原因并重新上架鹦鹉。

#### Acceptance Criteria

1. WHEN 用户对已售鹦鹉执行"退货"操作 THEN Mini_Program SHALL 显示退货原因输入框
2. WHEN 用户确认退货 THEN Mini_Program SHALL 将销售记录移至历史表，鹦鹉状态变为待售
3. WHEN 退货完成 THEN Mini_Program SHALL 在销售时间线中记录退货事件

### Requirement 7: 回访管理

**User Story:** As a 养殖场管理员, I want 记录客户回访情况, so that 我能做好售后服务跟踪。

#### Acceptance Criteria

1. WHEN 用户对已售鹦鹉执行"回访"操作 THEN Mini_Program SHALL 显示回访状态选择和备注输入
2. THE Mini_Program SHALL 支持三种回访状态：待回访、已回访、无法联系
3. WHEN 用户保存回访记录 THEN Mini_Program SHALL 更新鹦鹉的回访状态并创建回访历史

### Requirement 8: 种鸟配对管理

**User Story:** As a 养殖场管理员, I want 管理种鸟配对, so that 我能进行繁殖计划管理。

#### Acceptance Criteria

1. WHEN 用户将待售鹦鹉设为种鸟 THEN Mini_Program SHALL 更新状态为 breeding
2. WHEN 用户为公鸟选择配对 THEN Mini_Program SHALL 显示可配对的母鸟列表
3. WHEN 用户确认配对 THEN Mini_Program SHALL 更新双方状态为 paired 并记录配对时间
4. WHEN 用户取消配对 THEN Mini_Program SHALL 恢复双方状态为 breeding
5. IF 鹦鹉性别为未验卡 THEN Mini_Program SHALL 禁止设为种鸟

### Requirement 9: 孵化记录管理

**User Story:** As a 养殖场管理员, I want 记录和追踪孵化过程, so that 我能管理繁殖进度。

#### Acceptance Criteria

1. WHEN 用户创建孵化记录 THEN Mini_Program SHALL 要求选择父母鸟、开始日期、预计孵化日期、蛋数
2. WHEN 用户查看孵化列表 THEN Mini_Program SHALL 显示所有孵化记录及其状态（孵化中/已孵化/失败）
3. WHEN 用户更新孵化记录 THEN Mini_Program SHALL 支持修改实际孵化日期、孵化数量、状态
4. WHEN 孵化记录创建 THEN Mini_Program SHALL 更新父母鸟状态为 incubating

### Requirement 10: 分享功能

**User Story:** As a 养殖场管理员, I want 生成鹦鹉信息分享链接, so that 我能方便地向客户展示鹦鹉。

#### Acceptance Criteria

1. WHEN 用户点击分享按钮 THEN Mini_Program SHALL 生成包含鹦鹉信息的分享链接
2. WHEN 用户分享到微信 THEN Mini_Program SHALL 调用微信分享 API 生成分享卡片
3. WHEN 访客打开分享链接 THEN Mini_Program SHALL 显示鹦鹉的公开信息（照片、品种、价格等）

### Requirement 11: 统计分析

**User Story:** As a 养殖场管理员, I want 查看详细的统计分析, so that 我能了解业务趋势和做出决策。

#### Acceptance Criteria

1. WHEN 用户查看统计页面 THEN Mini_Program SHALL 显示销售统计、退货统计、孵化统计
2. THE Mini_Program SHALL 显示月度销售趋势图表
3. THE Mini_Program SHALL 显示品种销售排行
4. THE Mini_Program SHALL 显示退货率统计

### Requirement 12: 数据同步与离线支持

**User Story:** As a 养殖场管理员, I want 在网络不稳定时也能使用基本功能, so that 我的工作不会因网络问题中断。

#### Acceptance Criteria

1. WHEN 网络请求失败 THEN Mini_Program SHALL 显示友好的错误提示并提供重试选项
2. WHEN 用户下拉刷新 THEN Mini_Program SHALL 重新加载当前页面数据
3. THE Mini_Program SHALL 缓存常用数据（品种列表、统计数据）以提升加载速度

### Requirement 13: UI/UX 设计规范

**User Story:** As a 用户, I want 使用美观易用的界面, so that 我能高效愉快地完成工作。

#### Acceptance Criteria

1. THE Mini_Program SHALL 采用现代简约的设计风格，配色与 Web 版保持一致（主色#9CAF88、辅色#C8A6A2）
2. THE Mini_Program SHALL 使用底部 TabBar 导航（首页、鹦鹉、销售、我的）
3. THE Mini_Program SHALL 所有交互操作提供即时反馈（加载状态、成功/失败提示）
4. THE Mini_Program SHALL 适配不同屏幕尺寸，确保在各种设备上显示正常
5. THE Mini_Program SHALL 使用流畅的过渡动画提升用户体验
