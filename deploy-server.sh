#!/bin/bash
# 部署脚本 - 在本地执行

set -e

SERVER="root@103.110.81.83"
PASSWORD="rQ24T4MkMViB"

echo "=== 1. 部署 React 前端 ==="
expect -c "
spawn scp -o StrictHostKeyChecking=no -r parrot-management-system/dist /root/parrot-web/
expect \"password:\"
send \"$PASSWORD\r\"
expect eof
"
echo "前端部署完成"

echo "=== 2. 部署后端代码 ==="
expect -c "
spawn rsync -avz --exclude='.git' --exclude='__pycache__' --exclude='*.pyc' --exclude='node_modules' -e \"ssh -o StrictHostKeyChecking=no\" . $SERVER:/root/parrot-backend/
expect \"password:\"
send \"$PASSWORD\r\"
expect eof
"
echo "后端代码部署完成"

echo "=== 3. 安装依赖并启动后端 ==="
expect -c "
spawn ssh -o StrictHostKeyChecking=no $SERVER
expect \"password:\"
send \"$PASSWORD\r\"
expect \"#\"
send \"cd /root/parrot-backend && pip install -r requirements.txt\r\"
expect \"#\"
send \"pkill -f uvicorn || true\r\"
expect \"#\"
send \"nohup uvicorn main:app --host 0.0.0.0 --port 8000 > /root/backend.log 2>&1 &\r\"
expect \"#\"
send \"sleep 2 && curl -s http://localhost:8000/health\r\"
expect \"#\"
send \"exit\r\"
expect eof
"
echo "后端启动完成"

echo "=== 4. 配置 Nginx ==="
expect -c "
spawn ssh -o StrictHostKeyChecking=no $SERVER
expect \"password:\"
send \"$PASSWORD\r\"
expect \"#\"
send \"cat > /etc/nginx/conf.d/parrot.conf << 'NGINX'
server {
    listen 80;
    server_name 103.110.81.83;

    location / {
        root /root/parrot-web/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /uploads {
        alias /root/uploads;
    }
}
NGINX
\r\"
expect \"#\"
send \"nginx -t && nginx -s reload\r\"
expect \"#\"
send \"exit\r\"
expect eof
"
echo "Nginx 配置完成"

echo ""
echo "=== 部署完成 ==="
echo "访问 http://103.110.81.83 查看前端"
echo "API: http://103.110.81.83/api"
