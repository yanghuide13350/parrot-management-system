#!/bin/bash
# 鹦鹉管理系统 - 服务器部署脚本
# 服务器: 103.110.81.83

set -e

echo "=========================================="
echo "鹦鹉管理系统 - 服务器部署"
echo "=========================================="

# 配置
SERVER_IP="103.110.81.83"
SERVER_USER="root"
REMOTE_DIR="/var/www/parrot-system"

# 本地构建前端
echo "[1/5] 构建前端..."
cd parrot-management-system
npm run build
cd ..

# 打包文件
echo "[2/5] 打包部署文件..."
tar -czf deploy-package.tar.gz \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='venv' \
    --exclude='*.db' \
    --exclude='uploads/*' \
    --exclude='parrot-management-system/node_modules' \
    app/ \
    main.py \
    requirements.txt \
    init_database.py \
    parrot-management-system/dist/

echo "[3/5] 上传到服务器..."
scp deploy-package.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

echo "[4/5] 在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
set -e

# 创建目录
mkdir -p /var/www/parrot-system
cd /var/www/parrot-system

# 备份数据库和上传文件
if [ -f "parrot_management.db" ]; then
    cp parrot_management.db /tmp/parrot_management.db.bak
fi
if [ -d "uploads" ]; then
    cp -r uploads /tmp/uploads.bak
fi

# 解压新文件
tar -xzf /tmp/deploy-package.tar.gz

# 恢复数据库和上传文件
if [ -f "/tmp/parrot_management.db.bak" ]; then
    cp /tmp/parrot_management.db.bak parrot_management.db
fi
if [ -d "/tmp/uploads.bak" ]; then
    cp -r /tmp/uploads.bak/* uploads/ 2>/dev/null || true
fi

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 安装依赖
source venv/bin/activate
pip install -r requirements.txt

# 创建上传目录
mkdir -p uploads

# 重启后端服务
if systemctl is-active --quiet parrot-api; then
    systemctl restart parrot-api
    echo "后端服务已重启"
else
    echo "后端服务未配置为 systemd 服务，请手动重启"
fi

# 配置 Nginx（如果需要）
echo "部署完成！"
echo "前端文件位置: /var/www/parrot-system/parrot-management-system/dist/"
echo "后端入口: /var/www/parrot-system/main.py"

ENDSSH

echo "[5/5] 清理本地临时文件..."
rm -f deploy-package.tar.gz

echo "=========================================="
echo "部署完成！"
echo "=========================================="
