#!/bin/bash
# 在服务器上执行的部署命令
# 服务器: 103.110.81.83

set -e

echo "=========================================="
echo "鹦鹉管理系统 - 服务器部署"
echo "=========================================="

# 创建项目目录
mkdir -p /var/www/parrot-system
cd /var/www/parrot-system

# 备份现有数据库和上传文件
if [ -f "parrot_management.db" ]; then
    echo "备份数据库..."
    cp parrot_management.db /tmp/parrot_management.db.bak
fi
if [ -d "uploads" ] && [ "$(ls -A uploads 2>/dev/null)" ]; then
    echo "备份上传文件..."
    cp -r uploads /tmp/uploads.bak
fi

# 解压新文件
echo "解压部署包..."
tar -xzf /tmp/deploy-package.tar.gz

# 恢复数据库和上传文件
if [ -f "/tmp/parrot_management.db.bak" ]; then
    echo "恢复数据库..."
    cp /tmp/parrot_management.db.bak parrot_management.db
fi
if [ -d "/tmp/uploads.bak" ]; then
    echo "恢复上传文件..."
    mkdir -p uploads
    cp -r /tmp/uploads.bak/* uploads/ 2>/dev/null || true
fi

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

# 安装依赖
echo "安装Python依赖..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 创建上传目录
mkdir -p uploads
chmod 755 uploads

# 创建 systemd 服务文件（如果不存在）
if [ ! -f "/etc/systemd/system/parrot-api.service" ]; then
    echo "创建 systemd 服务..."
    cat > /etc/systemd/system/parrot-api.service << 'EOF'
[Unit]
Description=Parrot Management System API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/parrot-system
Environment="PATH=/var/www/parrot-system/venv/bin"
ExecStart=/var/www/parrot-system/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable parrot-api
fi

# 重启后端服务
echo "重启后端服务..."
systemctl restart parrot-api
sleep 2
systemctl status parrot-api --no-pager

# 配置 Nginx（如果已安装）
if command -v nginx &> /dev/null; then
    echo "配置 Nginx..."
    cat > /etc/nginx/sites-available/parrot-system << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    root /var/www/parrot-system/parrot-management-system/dist;
    index index.html;
    
    # 上传文件大小限制
    client_max_body_size 500M;
    
    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # 上传文件
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # SPA 路由 - 所有其他请求返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/parrot-system /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    # 测试并重启 Nginx
    nginx -t && systemctl restart nginx
    echo "Nginx 配置完成"
else
    echo "Nginx 未安装，跳过配置"
    echo "你可以直接通过 http://103.110.81.83:8000 访问 API"
fi

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "访问地址："
echo "  - 前端: http://103.110.81.83"
echo "  - API: http://103.110.81.83/api"
echo "  - API文档: http://103.110.81.83/api/docs"
echo ""
echo "如果 Nginx 未安装，可以直接访问:"
echo "  - API: http://103.110.81.83:8000"
echo "  - API文档: http://103.110.81.83:8000/docs"
