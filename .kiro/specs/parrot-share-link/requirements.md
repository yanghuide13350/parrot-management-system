# Requirements Document

## Introduction

本功能为鹦鹉管理系统添加在线分享链接功能，允许用户快速生成一个公开访问的链接，方便在闲鱼、微信等平台分享鹦鹉信息给潜在买家。买家点击链接即可查看鹦鹉的详细信息、照片和视频，无需下载任何文件。

## Glossary

- **Share_Link_Generator**: 生成分享链接的服务组件
- **Share_Page**: 公开访问的鹦鹉展示页面
- **Share_Token**: 唯一标识分享链接的令牌字符串
- **Share_Record**: 存储分享链接信息的数据库记录
- **Expiration_Time**: 分享链接的有效期截止时间

## Requirements

### Requirement 1: 生成分享链接

**User Story:** As a 鹦鹉卖家, I want to 一键生成分享链接, so that 我可以快速将鹦鹉信息分享给闲鱼或其他平台的买家。

#### Acceptance Criteria

1. WHEN 用户点击"生成分享链接"按钮 THEN THE Share_Link_Generator SHALL 创建一个唯一的 Share_Token 并返回完整的分享 URL
2. WHEN 生成分享链接时 THEN THE Share_Link_Generator SHALL 将 Share_Record 存储到数据库，包含 parrot_id、token、创建时间和过期时间
3. THE Share_Token SHALL 使用至少 16 字符的随机字符串以确保唯一性和安全性
4. WHEN 分享链接生成成功 THEN THE System SHALL 自动将链接复制到剪贴板并显示成功提示
5. THE Share_Link_Generator SHALL 为同一只鹦鹉生成的新链接不影响已有链接的有效性

### Requirement 2: 访问分享页面

**User Story:** As a 潜在买家, I want to 通过分享链接查看鹦鹉信息, so that 我可以了解鹦鹉的详细情况并决定是否购买。

#### Acceptance Criteria

1. WHEN 访问有效的分享链接 THEN THE Share_Page SHALL 显示鹦鹉的完整信息，包括品种、性别、价格、年龄、圈号和健康备注
2. WHEN 访问有效的分享链接 THEN THE Share_Page SHALL 显示该鹦鹉的所有照片和视频，支持查看和播放
3. THE Share_Page SHALL 采用移动端优先的响应式设计，在手机上有良好的浏览体验
4. WHEN 访问分享页面 THEN THE Share_Page SHALL 不显示任何管理功能按钮，仅展示信息
5. THE Share_Page SHALL 支持图片的放大查看和视频的在线播放

### Requirement 3: 链接有效期管理

**User Story:** As a 鹦鹉卖家, I want to 控制分享链接的有效期, so that 我可以保护隐私并在鹦鹉售出后使链接失效。

#### Acceptance Criteria

1. THE Share_Link_Generator SHALL 默认设置链接有效期为 7 天
2. WHEN 分享链接过期 THEN THE Share_Page SHALL 显示"链接已过期"的友好提示页面
3. WHEN 访问无效或不存在的分享链接 THEN THE Share_Page SHALL 显示"链接无效"的友好提示页面
4. WHEN 鹦鹉状态变为"已售"或"已退货" THEN THE System SHALL 保持现有分享链接可访问，但在页面上显示当前状态

### Requirement 4: 分享链接管理

**User Story:** As a 鹦鹉卖家, I want to 查看和管理已生成的分享链接, so that 我可以追踪分享情况并在需要时使链接失效。

#### Acceptance Criteria

1. WHEN 用户查看鹦鹉详情 THEN THE System SHALL 显示该鹦鹉已生成的有效分享链接列表
2. WHEN 用户点击"复制链接"按钮 THEN THE System SHALL 将对应链接复制到剪贴板
3. WHEN 用户点击"删除链接"按钮 THEN THE System SHALL 使该分享链接立即失效
4. THE System SHALL 显示每个分享链接的创建时间和剩余有效期

### Requirement 5: 分享页面内容展示

**User Story:** As a 潜在买家, I want to 在分享页面上看到清晰美观的鹦鹉信息, so that 我可以快速了解鹦鹉情况并产生购买兴趣。

#### Acceptance Criteria

1. THE Share_Page SHALL 在页面顶部突出显示鹦鹉品种和价格
2. THE Share_Page SHALL 以卡片形式展示鹦鹉的基本信息（性别、年龄、圈号等）
3. THE Share_Page SHALL 以网格布局展示照片和视频，支持滑动浏览
4. WHEN 页面包含视频 THEN THE Share_Page SHALL 显示视频缩略图，点击后播放
5. THE Share_Page SHALL 在页面底部显示生成时间，不显示卖家个人信息
6. THE Share_Page SHALL 支持长按图片保存到手机相册的原生功能
