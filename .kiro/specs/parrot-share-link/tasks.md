# Implementation Plan: 鹦鹉分享链接功能

## Overview

本实现计划将分享链接功能分解为后端 API、数据库模型、前端组件三个主要部分，采用增量开发方式，确保每个步骤都可验证。

## Tasks

- [ ] 1. 创建数据库模型和 Schema

  - [x] 1.1 创建 ShareLink 数据模型
    - 在 `app/models/` 目录下创建 `share_link.py`
    - 定义 ShareLink 表结构：id, parrot_id, token, created_at, expires_at, is_active
    - 添加与 Parrot 模型的外键关联
    - 在 `app/models/__init__.py` 中导出模型
    - _Requirements: 1.2_
  - [x] 1.2 创建 Pydantic Schema
    - 在 `app/schemas/` 目录下创建 `share.py`
    - 定义 ShareLinkResponse, ShareDataResponse, ParrotShareInfo 等 Schema
    - _Requirements: 2.1, 4.4_

- [ ] 2. 实现后端分享链接 API

  - [x] 2.1 创建分享 API 路由模块
    - 在 `app/api/` 目录下创建 `share.py`
    - 实现 POST `/api/share/generate/{parrot_id}` 生成分享链接
    - 使用 `secrets.token_urlsafe(16)` 生成 token
    - 设置默认 7 天有效期
    - _Requirements: 1.1, 1.2, 1.3, 3.1_
  - [x] 2.2 实现获取分享数据接口
    - 实现 GET `/api/share/{token}` 获取分享数据
    - 验证 token 有效性和过期时间
    - 返回鹦鹉信息和照片/视频列表
    - 处理过期和无效链接的错误响应
    - _Requirements: 2.1, 2.2, 3.2, 3.3_
  - [x] 2.3 实现链接管理接口
    - 实现 GET `/api/share/list/{parrot_id}` 获取链接列表
    - 实现 DELETE `/api/share/{token}` 删除链接
    - _Requirements: 4.1, 4.3, 4.4_
  - [x] 2.4 注册 API 路由到主应用
    - 在 `main.py` 中注册 share router
    - _Requirements: 1.1_

- [ ] 3. Checkpoint - 后端 API 测试

  - 确保所有 API 端点可正常访问
  - 使用 FastAPI 文档页面 `/docs` 手动测试各接口
  - 确保数据库表正确创建

- [ ] 4. 实现前端分享页面

  - [x] 4.1 创建分享页面组件
    - 在 `parrot-management-system/src/pages/` 下创建 `SharePage.tsx`
    - 实现移动端优先的响应式布局
    - 显示鹦鹉基本信息（品种、价格、性别、年龄等）
    - 显示照片网格和视频播放
    - 处理过期/无效链接的错误页面
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [x] 4.2 添加分享页面路由
    - 在 `routes.tsx` 中添加 `/share/:token` 路由
    - 配置为公开访问（无需登录）
    - _Requirements: 2.1_

- [ ] 5. 实现前端分享功能集成

  - [x] 5.1 添加分享服务 API
    - 在 `parrot-management-system/src/services/` 下创建或更新 `shareService.ts`
    - 实现生成链接、获取链接列表、删除链接的 API 调用
    - _Requirements: 1.1, 4.1, 4.3_
  - [x] 5.2 更新 ParrotDetail 组件
    - 添加"生成分享链接"按钮
    - 实现点击生成链接并自动复制到剪贴板
    - 显示已生成的分享链接列表
    - 支持复制和删除已有链接
    - _Requirements: 1.1, 1.4, 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Checkpoint - 功能集成测试

  - 确保前后端联调正常
  - 测试生成链接、访问分享页、删除链接完整流程
  - 在手机浏览器上测试分享页面显示效果

- [ ]\* 7. 编写属性测试

  - [ ]\* 7.1 编写链接生成属性测试
    - **Property 1: 链接生成完整性**
    - **Property 2: Token 唯一性**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [ ]\* 7.2 编写链接访问属性测试
    - **Property 4: 有效链接数据完整性**
    - **Property 5: 默认有效期**
    - **Validates: Requirements 2.1, 2.2, 3.1**
  - [ ]\* 7.3 编写链接管理属性测试
    - **Property 3: 多链接独立性**
    - **Property 6: 状态变更不影响链接**
    - **Property 7: 链接列表完整性**
    - **Property 8: 链接删除有效性**
    - **Validates: Requirements 1.5, 3.4, 4.1, 4.3, 4.4**

- [ ] 8. Final Checkpoint
  - 确保所有功能正常工作
  - 确保所有测试通过
  - 询问用户是否有其他问题

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 技术栈：FastAPI + SQLAlchemy (后端), React + TypeScript + Ant Design (前端)
- 分享页面需要特别注意移动端体验，因为主要使用场景是手机分享
- Token 使用 URL 安全的随机字符串，避免特殊字符导致的 URL 问题
