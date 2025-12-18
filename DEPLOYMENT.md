# 鹦鹉管理系统 - 生产环境部署指南

## 📋 目录

- [系统要求](#系统要求)
- [数据库配置](#数据库配置)
- [后端部署](#后端部署)
- [前端部署](#前端部署)
- [Nginx配置](#nginx配置)
- [系统服务配置](#系统服务配置)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

---

## 🖥️ 系统要求

### 服务器配置
- **CPU**: 2核心以上
- **内存**: 4GB以上
- **存储**: 50GB以上 SSD
- **操作系统**: Ubuntu 20.04 LTS / CentOS 8 / Debian 11

### 软件依赖
- Python 3.9+
- Node.js 18+
- MySQL 8.0+ 或 PostgreSQL 13+
- Nginx 1.18+
- PM2 (进程管理器)

---

## 🗄️ 数据库配置

### 选项1: MySQL (推荐)

#### 1.1 安装MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# 启动并设置开机自启
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### 1.2 配置MySQL
```bash
# 安全配置
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql -u root -p
```

```sql
-- 在MySQL中执行
CREATE DATABASE parrot_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'parrot_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON parrot_management.* TO 'parrot_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 1.3 配置数据库连接
```bash
# 复制环境配置模板
cp .env.example .env

# 编辑配置文件
nano .env
```

```env
DATABASE_URL=mysql+pymysql://parrot_user:your_strong_password@localhost:3306/parrot_management
DEBUG=false
CORS_ORIGINS=["https://yourdomain.com"]
```

### 选项2: PostgreSQL

#### 2.1 安装PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动并设置开机自启
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2.2 配置PostgreSQL
```bash
# 切换到postgres用户
sudo -u postgres psql
```

```sql
-- 在PostgreSQL中执行
CREATE DATABASE parrot_management;
CREATE USER parrot_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE parrot_management TO parrot_user;
\q
```

#### 2.3 配置数据库连接
```env
DATABASE_URL=postgresql://parrot_user:your_strong_password@localhost:5432/parrot_management
```

---

## 🚀 后端部署

### 步骤1: 准备环境

```bash
# 创建项目目录
sudo mkdir -p /var/www/parrot-management
sudo chown $USER:$USER /var/www/parrot-management

# 克隆代码
cd /var/www/parrot-management
git clone https://gitee.com/your_username/parrot-management-system.git .

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install --upgrade pip
pip install -r requirements.txt
```

### 步骤2: 配置环境变量

```bash
# 复制并编辑配置文件
cp .env.example .env
nano .env
```

**重要配置项:**
```env
# 数据库配置 (必填)
DATABASE_URL=mysql+pymysql://parrot_user:密码@localhost:3306/parrot_management

# 应用配置
DEBUG=false
APP_NAME=鹦鹉管理系统 API
CORS_ORIGINS=["https://yourdomain.com"]

# 文件上传配置
UPLOAD_DIR=/var/www/parrot-management/uploads
MAX_FILE_SIZE=524288000
```

### 步骤3: 初始化数据库

```bash
# 激活虚拟环境
source venv/bin/activate

# 运行数据库初始化脚本
python init_database.py
```

### 步骤4: 测试API

```bash
# 启动开发服务器测试
uvicorn main:app --host 0.0.0.0 --port 8000

# 在另一个终端测试
curl http://localhost:8000/health
```

---

## 🎨 前端部署

### 步骤1: 构建前端

```bash
# 在项目根目录执行
cd /var/www/parrot-management

# 激活虚拟环境
source venv/bin/activate

# 构建前端
cd parrot-management-system
npm install
npm run build
```

### 步骤2: 复制静态文件

```bash
# 创建静态文件目录
sudo mkdir -p /var/www/parrot-management/static
sudo cp -r dist/* /var/www/parrot-management/static/

# 设置权限
sudo chown -R www-data:www-data /var/www/parrot-management/static
sudo chmod -R 755 /var/www/parrot-management/static
```

---

## 🌐 Nginx配置

### 创建Nginx配置文件

```bash
sudo nano /etc/nginx/sites-available/parrot-management
```

### 配置内容

```nginx
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL证书配置 (使用Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 静态文件
    location /static/ {
        alias /var/www/parrot-management/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }

    # 文件上传
    location /uploads/ {
        alias /var/www/parrot-management/uploads/;
        expires 30d;
    }

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/parrot-management/static;
    }

    # 日志
    access_log /var/log/nginx/parrot-management_access.log;
    error_log /var/log/nginx/parrot-management_error.log;
}
```

### 启用站点

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/parrot-management /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl reload nginx
```

---

## ⚙️ 系统服务配置

### 创建Systemd服务

```bash
sudo nano /etc/systemd/system/parrot-management.service
```

### 服务配置

```ini
[Unit]
Description=Parrot Management System API
After=network.target mysql.service postgresql.service

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/var/www/parrot-management
Environment=PATH=/var/www/parrot-management/venv/bin
ExecStart=/var/www/parrot-management/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10

# 安全配置
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/www/parrot-management/uploads

[Install]
WantedBy=multi-user.target
```

### 启用并启动服务

```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启用并启动服务
sudo systemctl enable parrot-management
sudo systemctl start parrot-management

# 查看服务状态
sudo systemctl status parrot-management
```

---

## 📊 监控和维护

### 日志管理

```bash
# 查看API日志
sudo journalctl -u parrot-management -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/parrot-management_access.log
sudo tail -f /var/log/nginx/parrot-management_error.log

# 数据库日志
# MySQL: /var/log/mysql/error.log
# PostgreSQL: /var/log/postgresql/postgresql-13-main.log
```

### 备份脚本

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/parrot-management"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
if [ "$DATABASE_TYPE" = "mysql" ]; then
    mysqldump -u parrot_user -p'your_password' parrot_management > $BACKUP_DIR/database_$DATE.sql
elif [ "$DATABASE_TYPE" = "postgresql" ]; then
    pg_dump -U parrot_user parrot_management > $BACKUP_DIR/database_$DATE.sql
fi

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/parrot-management/uploads

# 保留最近7天的备份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 自动备份 (cron)

```bash
# 编辑crontab
crontab -e

# 添加每日备份任务 (每天凌晨2点)
0 2 * * * /var/www/parrot-management/backup.sh >> /var/log/parrot-backup.log 2>&1
```

### 更新流程

```bash
#!/bin/bash
# update.sh

cd /var/www/parrot-management
git pull origin master

# 激活虚拟环境
source venv/bin/activate

# 更新依赖
pip install -r requirements.txt

# 运行数据库迁移 (如果有)
if [ -f "alembic.ini" ]; then
    alembic upgrade head
fi

# 重新构建前端
cd parrot-management-system
npm install
npm run build
cd ..

# 重启服务
sudo systemctl restart parrot-management

echo "Update completed"
```

---

## 🔧 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库服务状态
sudo systemctl status mysql
# 或
sudo systemctl status postgresql

# 检查网络连接
telnet localhost 3306  # MySQL
telnet localhost 5432  # PostgreSQL

# 检查配置
cat .env | grep DATABASE_URL
```

#### 2. API服务启动失败
```bash
# 检查服务状态
sudo systemctl status parrot-management

# 查看错误日志
sudo journalctl -u parrot-management --no-pager

# 手动测试
source venv/bin/activate
uvicorn main:app --reload
```

#### 3. 静态文件404
```bash
# 检查文件是否存在
ls -la /var/www/parrot-management/static/

# 检查Nginx配置
sudo nginx -t

# 检查文件权限
sudo chown -R www-data:www-data /var/www/parrot-management/static
```

#### 4. 文件上传失败
```bash
# 检查上传目录权限
sudo chown -R www-data:www-data /var/www/parrot-management/uploads
sudo chmod -R 755 /var/www/parrot-management/uploads

# 检查Nginx上传限制
# 在nginx.conf的http块中添加:
client_max_body_size 500M;
```

### 性能优化

#### 1. 数据库优化
```sql
-- MySQL优化
-- 在/etc/mysql/mysql.conf.d/mysqld.cnf中添加:
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
```

#### 2. Nginx优化
```nginx
# 在nginx.conf的http块中添加:
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

#### 3. Python优化
```bash
# 使用Gunicorn替代Uvicorn (生产环境)
pip install gunicorn

# 修改服务配置
ExecStart=/var/www/parrot-management/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
```

---

## 📝 检查清单

部署完成后，请确认以下项目：

- [ ] 数据库连接正常
- [ ] API服务运行正常 (`curl http://localhost:8000/health`)
- [ ] 前端页面可以访问
- [ ] 文件上传功能正常
- [ ] 日志记录正常
- [ ] 备份脚本运行正常
- [ ] SSL证书配置正确
- [ ] 防火墙规则配置正确

---

## 📞 技术支持

如果遇到问题，请检查：
1. 系统日志: `sudo journalctl -u parrot-management`
2. Nginx日志: `/var/log/nginx/`
3. 数据库日志: `/var/log/mysql/` 或 `/var/log/postgresql/`

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
