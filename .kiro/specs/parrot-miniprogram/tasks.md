# Implementation Plan: 鹦鹉管理小程序

## Overview

基于微信小程序原生框架开发，复用现有 FastAPI 后端，采用现代 UI 设计风格（毛玻璃+渐变）实现完整的鹦鹉管理功能。

## Tasks

- [ ] 1. 项目初始化与基础架构

  - [ ] 1.1 创建小程序项目结构
    - 使用微信开发者工具创建项目
    - 配置 app.json 全局设置
    - 创建目录结构（pages、components、services、utils、styles）
    - _Requirements: 13.1, 13.2_
  - [ ] 1.2 配置全局样式变量
    - 创建 styles/variables.wxss 定义色彩、间距、圆角系统
    - 创建 styles/common.wxss 定义公共样式类
    - 实现毛玻璃效果样式
    - _Requirements: 13.1_
  - [ ] 1.3 实现自定义 TabBar 组件
    - 创建 custom-tab-bar 组件
    - 实现悬浮胶囊式设计
    - 配置四个 Tab 页面路由
    - _Requirements: 13.2_
  - [ ] 1.4 封装 API 请求服务
    - 创建 utils/request.js 统一请求封装
    - 实现 loading 状态管理
    - 实现错误处理和提示
    - 创建 services/api.js 定义所有 API 方法
    - _Requirements: 12.1_
  - [ ] 1.5 编写 API 服务单元测试
    - 测试请求参数构建
    - 测试错误处理逻辑
    - _Requirements: 12.1_

- [ ] 2. 首页仪表盘

  - [ ] 2.1 实现首页页面结构
    - 创建 pages/index/index 页面
    - 实现渐变背景头部
    - 实现统计卡片横向滚动区
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ] 2.2 实现统计卡片组件
    - 创建 components/stat-card 组件
    - 实现毛玻璃效果
    - 实现数字计数动画
    - 实现点击跳转功能
    - _Requirements: 1.1, 1.4_
  - [ ] 2.3 实现月度销售图表
    - 集成 wx-charts 或 ECharts
    - 实现销售额/销售量切换
    - 实现渐变色图表样式
    - _Requirements: 1.2, 11.2_
  - [ ] 2.4 实现品种分布展示
    - 实现彩色标签云布局
    - 实现点击筛选跳转
    - _Requirements: 1.3, 11.3_
  - [ ] 2.5 编写首页数据加载测试
    - 测试统计数据正确显示
    - _Requirements: 1.1_

- [ ] 3. 鹦鹉列表页

  - [ ] 3.1 实现列表页面结构
    - 创建 pages/parrot/list/index 页面
    - 实现毛玻璃搜索框
    - 实现筛选按钮和角标
    - _Requirements: 2.1, 2.2_
  - [ ] 3.2 实现筛选抽屉组件
    - 创建 components/filter-drawer 组件
    - 实现品种、性别、状态标签多选
    - 实现价格区间滑块
    - 实现重置和确认按钮
    - _Requirements: 2.3_
  - [ ] 3.3 实现鹦鹉卡片组件
    - 创建 components/parrot-card 组件
    - 实现双列瀑布流布局
    - 实现照片展示和状态标签
    - 实现点击反馈动画
    - _Requirements: 2.1, 2.5_
  - [ ] 3.4 实现无限滚动加载
    - 实现下拉刷新
    - 实现触底加载更多
    - 实现加载状态和空状态
    - _Requirements: 2.4_
  - [ ] 3.5 实现悬浮添加按钮
    - 实现渐变色圆形按钮
    - 实现脉冲动画效果
    - _Requirements: 4.1_
  - [ ] 3.6 编写搜索筛选属性测试
    - **Property 1: 搜索结果匹配性**
    - **Property 2: 筛选结果一致性**
    - **Validates: Requirements 2.2, 2.3**
  - [ ] 3.7 编写分页属性测试
    - **Property 3: 分页数据完整性**
    - **Validates: Requirements 2.1**

- [ ] 4. 鹦鹉详情页

  - [ ] 4.1 实现详情页面结构
    - 创建 pages/parrot/detail/index 页面
    - 实现全宽照片轮播
    - 实现底部渐变遮罩
    - _Requirements: 3.1_
  - [ ] 4.2 实现照片/视频展示
    - 实现 swiper 轮播组件
    - 实现视频自动播放
    - 实现手势缩放预览
    - _Requirements: 3.1_
  - [ ] 4.3 实现信息卡片区
    - 实现毛玻璃信息卡片
    - 显示品种、性别、年龄、圈号、价格
    - 实现价格渐变色样式
    - _Requirements: 3.1_
  - [ ] 4.4 实现销售时间线组件
    - 创建 components/timeline 组件
    - 实现彩色圆点连线
    - 实现展开/收起动画
    - _Requirements: 3.1_
  - [ ] 4.5 实现底部操作栏
    - 根据状态显示不同操作按钮
    - 实现渐变主按钮和描边次按钮
    - _Requirements: 3.1_

- [ ] 5. 添加/编辑鹦鹉

  - [ ] 5.1 实现添加鹦鹉页面
    - 创建 pages/parrot/add/index 页面
    - 实现表单布局
    - 实现品种、性别选择器
    - 实现日期选择器
    - _Requirements: 4.1, 4.2_
  - [ ] 5.2 实现照片上传组件
    - 创建 components/photo-uploader 组件
    - 调用 wx.chooseMedia 选择照片/视频
    - 实现上传进度显示
    - 实现预览和删除功能
    - _Requirements: 3.3_
  - [ ] 5.3 实现表单验证
    - 实现必填字段验证（品种、性别）
    - 实现圈号唯一性检查
    - 实现价格区间验证
    - _Requirements: 3.4, 3.5, 4.2, 4.3_
  - [ ] 5.4 实现编辑鹦鹉页面
    - 创建 pages/parrot/edit/index 页面
    - 复用添加页面组件
    - 实现数据回填
    - _Requirements: 3.2_
  - [ ] 5.5 编写表单验证属性测试
    - **Property 4: 表单必填字段验证**
    - **Validates: Requirements 3.4, 4.2**
  - [ ] 5.6 编写创建 round-trip 属性测试
    - **Property 5: 鹦鹉创建 round-trip**
    - **Validates: Requirements 4.3**

- [ ] 6. Checkpoint - 核心功能验证

  - 确保首页、列表、详情、添加/编辑功能正常
  - 确保所有测试通过
  - 如有问题请询问用户

- [ ] 7. 销售管理

  - [ ] 7.1 实现销售记录列表页
    - 创建 pages/sales/list/index 页面
    - 实现顶部统计卡片
    - 实现卡片式列表
    - 实现左滑操作按钮
    - _Requirements: 5.3, 5.4_
  - [ ] 7.2 实现销售表单弹窗
    - 创建销售信息输入表单
    - 实现售卖人选择
    - 实现购买者、价格、联系方式输入
    - _Requirements: 5.1, 5.2_
  - [ ] 7.3 实现退货功能
    - 实现退货原因输入弹窗
    - 调用退货 API
    - 更新列表状态
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 7.4 实现回访功能
    - 实现回访状态选择弹窗
    - 实现回访备注输入
    - 调用回访 API
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ] 7.5 编写销售状态转换属性测试
    - **Property 6: 销售状态转换**
    - **Validates: Requirements 5.2**
  - [ ] 7.6 编写退货属性测试
    - **Property 7: 退货状态转换与历史记录**
    - **Validates: Requirements 6.2, 6.3**
  - [ ] 7.7 编写回访属性测试
    - **Property 8: 回访状态有效性**
    - **Property 9: 回访记录创建**
    - **Validates: Requirements 7.2, 7.3**

- [ ] 8. 种鸟配对管理

  - [ ] 8.1 实现种鸟列表页
    - 创建 pages/breeding/list/index 页面
    - 筛选显示 breeding 和 paired 状态的鹦鹉
    - 显示配对状态和配偶信息
    - _Requirements: 8.1_
  - [ ] 8.2 实现设为种鸟功能
    - 在鹦鹉详情页添加"设为种鸟"按钮
    - 实现年龄警告提示
    - 调用状态更新 API
    - _Requirements: 8.1, 8.5_
  - [ ] 8.3 实现配对功能
    - 创建 pages/breeding/pair/index 页面
    - 显示可配对母鸟列表
    - 实现配对确认弹窗
    - _Requirements: 8.2, 8.3_
  - [ ] 8.4 实现取消配对功能
    - 在种鸟详情添加取消配对按钮
    - 实现确认弹窗
    - 调用取消配对 API
    - _Requirements: 8.4_
  - [ ] 8.5 编写配对属性测试
    - **Property 10: 种鸟状态转换**
    - **Property 11: 可配对列表正确性**
    - **Property 12: 配对关系一致性**
    - **Property 13: 取消配对 round-trip**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [ ] 9. 孵化记录管理

  - [ ] 9.1 实现孵化列表页
    - 创建 pages/incubation/list/index 页面
    - 显示孵化记录卡片
    - 显示状态标签（孵化中/已孵化/失败）
    - _Requirements: 9.2_
  - [ ] 9.2 实现添加孵化记录
    - 创建 pages/incubation/add/index 页面
    - 实现父母鸟选择器
    - 实现日期和蛋数输入
    - _Requirements: 9.1, 9.4_
  - [ ] 9.3 实现更新孵化记录
    - 实现编辑孵化记录页面
    - 支持更新实际孵化日期、孵化数量、状态
    - _Requirements: 9.3_
  - [ ] 9.4 编写孵化属性测试
    - **Property 14: 孵化记录创建影响**
    - **Validates: Requirements 9.4**

- [ ] 10. 分享功能

  - [ ] 10.1 实现分享按钮
    - 在鹦鹉详情页添加分享按钮
    - 调用分享链接生成 API
    - _Requirements: 10.1_
  - [ ] 10.2 实现微信分享
    - 配置页面分享参数
    - 实现 onShareAppMessage
    - 生成分享卡片
    - _Requirements: 10.2_
  - [ ] 10.3 实现分享页面
    - 创建 pages/share/index 页面
    - 解析分享 token
    - 显示鹦鹉公开信息
    - _Requirements: 10.3_

- [ ] 11. 统计分析页

  - [ ] 11.1 实现统计页面
    - 在"我的"页面添加统计入口
    - 显示销售统计、退货统计
    - _Requirements: 11.1_
  - [ ] 11.2 实现退货率统计
    - 计算并显示退货率
    - 显示退货趋势
    - _Requirements: 11.4_
  - [ ] 11.3 编写统计属性测试
    - **Property 15: 退货率计算正确性**
    - **Validates: Requirements 11.4**

- [ ] 12. 缓存与离线支持

  - [ ] 12.1 实现数据缓存
    - 创建 utils/storage.js 缓存工具
    - 缓存品种列表和统计数据
    - 实现缓存过期机制
    - _Requirements: 12.3_
  - [ ] 12.2 实现下拉刷新
    - 所有列表页支持下拉刷新
    - 刷新时清除相关缓存
    - _Requirements: 12.2_
  - [ ] 12.3 编写缓存属性测试
    - **Property 16: 缓存一致性**
    - **Validates: Requirements 12.3**

- [ ] 13. 我的页面

  - [ ] 13.1 实现我的页面
    - 创建 pages/profile/index 页面
    - 显示用户信息区
    - 显示功能入口列表
    - _Requirements: 13.2_
  - [ ] 13.2 实现设置功能
    - API 地址配置
    - 清除缓存功能
    - 关于页面
    - _Requirements: 12.3_

- [ ] 14. Final Checkpoint - 完整功能验证
  - 确保所有功能正常工作
  - 确保所有测试通过
  - 如有问题请询问用户

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
