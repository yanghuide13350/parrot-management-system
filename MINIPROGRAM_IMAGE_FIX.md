# 小程序图片显示问题修复报告

## 问题描述

小程序在生产环境中无法显示鹦鹉列表的附件图片，只显示占位图。本地开发环境正常。

## ✅ 已修复的问题

### 问题 1: Nginx 配置错误（已修复 ✓）

**原因**: Nginx 将 `/uploads/` 请求错误地代理到了后端 API (`proxy_pass http://127.0.0.1:8000/uploads/`)，而不是直接提供静态文件。

**修复内容**:

```nginx
# 修改前（错误）
location /uploads/ {
    proxy_pass http://127.0.0.1:8000/uploads/;  # 代理到后端
}

# 修改后（正确）
location /uploads/ {
    alias /var/www/parrot-system/uploads/;  # 直接提供静态文件
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "public, max-age=31536000";
    expires 1y;
}
```

**验证结果**:

- ✅ Nginx 配置测试通过
- ✅ Nginx 服务重启成功
- ✅ 图片 URL `http://103.110.81.83/uploads/parrots/xxx.jpg` 返回 200 OK
- ✅ 添加了 CORS 头和缓存控制

## ⚠️ 仍需解决的问题

### 问题 2: 微信小程序的 HTTPS 限制

微信小程序对网络请求有严格的安全限制:

1. **HTTPS 要求**: 生产环境必须使用 HTTPS 协议，不能使用 HTTP
2. **域名白名单**: 所有网络请求的域名必须在小程序后台配置白名单
3. **IP 地址限制**: 不建议直接使用 IP 地址，应该使用域名

**当前状态**:

- ❌ 服务器只配置了 HTTP (端口 80)
- ❌ 使用 IP 地址 `103.110.81.83` 而非域名
- ⚠️ 小程序在开发工具中可以通过"不校验合法域名"选项测试，但真机和正式版本无法加载图片

## 解决方案

### 方案一：配置 HTTPS（推荐）

#### 步骤 1: 获取域名

如果还没有域名，需要先购买一个域名并解析到服务器 IP `103.110.81.83`。

#### 步骤 2: 获取 SSL 证书

```bash
# 使用Let's Encrypt免费证书
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 申请证书（将yourdomain.com替换为实际域名）
sudo certbot --nginx -d yourdomain.com
```

#### 步骤 3: Nginx 会自动配置 HTTPS

Certbot 会自动修改 Nginx 配置，添加 SSL 证书和 HTTPS 监听。

#### 步骤 4: 更新小程序配置

```javascript
// miniprogram/app.js
App({
  globalData: {
    baseUrl: "https://yourdomain.com/api", // 改为HTTPS和域名
    userInfo: null,
  },
});
```

#### 步骤 5: 微信小程序后台配置

1. 登录微信公众平台 https://mp.weixin.qq.com
2. 进入"开发" -> "开发管理" -> "开发设置"
3. 在"服务器域名"中添加:
   - request 合法域名: `https://yourdomain.com`
   - uploadFile 合法域名: `https://yourdomain.com`
   - downloadFile 合法域名: `https://yourdomain.com`

### 方案二：开发环境临时方案（仅用于测试）

如果暂时没有域名和 HTTPS，可以在微信开发者工具中临时测试:

1. 打开微信开发者工具
2. 点击右上角"详情"
3. 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

**注意**: 这个方案只能在开发工具中使用，真机预览和正式版本仍然无法加载图片。

### 方案三：使用云存储（备选方案）

如果配置 HTTPS 困难，可以考虑使用微信云开发的云存储:

1. 开通微信云开发
2. 将图片上传到云存储
3. 使用云存储的 HTTPS 地址（自动符合微信小程序要求）

## 代码改进

已添加调试代码帮助定位问题:

### 1. 列表页面 (miniprogram/pages/parrot/list/index.js)

```javascript
// 已添加console.log输出图片URL
console.log("Base URL:", baseUrl);
console.log("Photo URL:", item.photo_url, "-> Full URL:", fullPhotoUrl);
```

### 2. 图片组件 (miniprogram/components/parrot-card/index.js)

```javascript
// 已添加图片加载成功/失败的回调
onImageError(e) {
  console.error('图片加载失败:', this.data.parrot.photo_url, e.detail)
},
onImageLoad(e) {
  console.log('图片加载成功:', this.data.parrot.photo_url)
}
```

### 3. 图片组件模板 (miniprogram/components/parrot-card/index.wxml)

```xml
<!-- 已添加错误和加载事件处理 -->
<image wx:if="{{parrot.photo_url && !parrot.has_video}}"
       src="{{parrot.photo_url}}"
       mode="aspectFill"
       binderror="onImageError"
       bindload="onImageLoad" />
```

## 验证步骤

### 当前可以验证的内容:

1. ✅ 在浏览器中访问 `http://103.110.81.83/uploads/parrots/xxx.jpg` 可以看到图片
2. ✅ Web 前端可以正常显示图片

### 需要在微信开发者工具中验证:

1. 打开微信开发者工具控制台
2. 查看 console.log 输出的 URL 是否正确
3. 查看是否有图片加载失败的错误信息
4. 检查错误信息中的具体原因（域名不在白名单、非 HTTPS 等）

### 配置 HTTPS 后需要验证:

1. 在浏览器中访问 `https://yourdomain.com/uploads/parrots/xxx.jpg` 可以看到图片
2. 在微信开发者工具中取消勾选"不校验合法域名"，图片仍然可以加载
3. 在真机上预览，图片可以正常显示

## 推荐实施顺序

1. **立即**: 在微信开发者工具中勾选"不校验合法域名"进行测试，验证 Nginx 修复是否生效
2. **短期**: 申请域名和 SSL 证书，配置 HTTPS
3. **中期**: 在微信小程序后台配置域名白名单
4. **长期**: 考虑使用 CDN 加速图片加载

## 技术细节

### 当前 Nginx 配置

```nginx
server {
    listen 80;
    server_name 103.110.81.83;
    client_max_body_size 100M;

    # 前端静态文件
    root /var/www/parrot-system/parrot-management-system/dist;
    index index.html;

    # 直接提供uploads目录的静态文件
    location /uploads/ {
        alias /var/www/parrot-system/uploads/;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "public, max-age=31536000";
        expires 1y;
    }

    # API 请求代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA 路由 - 所有其他请求返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 图片 URL 构建逻辑

```javascript
// miniprogram/pages/parrot/list/index.js
const app = getApp();
const baseUrl = app.globalData.baseUrl.replace("/api", ""); // http://103.110.81.83
const fullPhotoUrl = item.photo_url ? `${baseUrl}${item.photo_url}` : null;
// 结果: http://103.110.81.83/uploads/parrots/xxx.jpg
```

## 相关文件

- ✅ `miniprogram/app.js` - 全局配置
- ✅ `miniprogram/pages/parrot/list/index.js` - 列表页面（已添加调试）
- ✅ `miniprogram/components/parrot-card/index.js` - 卡片组件（已添加错误处理）
- ✅ `miniprogram/components/parrot-card/index.wxml` - 卡片模板（已添加事件绑定）
- ✅ `/etc/nginx/sites-enabled/parrot-system` - Nginx 配置（已修复）
- `app/api/parrots.py` - 后端 API

## 注意事项

1. ✅ Nginx 配置已修复，图片可以通过 HTTP 访问
2. ⚠️ 微信小程序正式版本必须使用 HTTPS
3. ⚠️ 域名必须备案（中国大陆服务器）
4. ⚠️ SSL 证书需要定期更新（Let's Encrypt 证书 3 个月有效期）
5. ⚠️ 配置域名白名单后需要重新发布小程序

## 下一步行动

1. 在微信开发者工具中测试，验证 Nginx 修复是否解决了图片加载问题
2. 如果开发工具中仍然无法加载，检查 console 输出的错误信息
3. 准备域名和 SSL 证书，配置 HTTPS
4. 在微信小程序后台配置域名白名单
5. 重新发布小程序
