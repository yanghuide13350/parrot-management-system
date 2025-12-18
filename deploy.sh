#!/bin/bash
# 鹦鹉管理系统 - 快速部署脚本

set -e  # 遇到错误立即退出

echo "=========================================="
echo "鹦鹉管理系统 - 生产环境部署脚本"
echo "=========================================="
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
    print_error "请不要使用root用户运行此脚本"
    exit 1
fi

# 检查系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
    print_info "检测到操作系统: $OS $VER"
else
    print_error "无法检测操作系统"
    exit 1
fi

# 检查Python版本
if ! command -v python3 &> /dev/null; then
    print_error "Python3 未安装"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
print_info "Python版本: $PYTHON_VERSION"

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装"
    exit 1
fi

NODE_VERSION=$(node --version)
print_info "Node.js版本: $NODE_VERSION"

# 获取项目路径
PROJECT_DIR=$(pwd)
print_info "项目路径: $PROJECT_DIR"

# 创建虚拟环境
print_info "创建Python虚拟环境..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 升级pip
print_info "升级pip..."
pip install --upgrade pip

# 安装Python依赖
print_info "安装Python依赖..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    print_error "requirements.txt 文件不存在"
    exit 1
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    print_warn ".env 文件不存在，正在从模板复制..."
    cp .env.example .env
    print_warn "请编辑 .env 文件配置数据库连接"
    print_warn "nano .env"
    read -p "配置完成后按回车继续..."
fi

# 初始化数据库
print_info "初始化数据库..."
python init_database.py

# 构建前端
if [ -d "parrot-management-system" ]; then
    print_info "构建前端..."
    cd parrot-management-system

    # 检查package.json
    if [ -f "package.json" ]; then
        # 安装npm依赖
        print_info "安装npm依赖..."
        npm install

        # 构建前端
        print_info "构建前端静态文件..."
        npm run build

        cd ..
    else
        print_warn "parrot-management-system/package.json 不存在，跳过前端构建"
        cd ..
    fi
else
    print_warn "parrot-management-system 目录不存在，跳过前端构建"
fi

# 创建上传目录
print_info "创建上传目录..."
mkdir -p uploads
chmod 755 uploads

# 测试API
print_info "测试API服务..."
print_info "启动开发服务器 (按Ctrl+C停止)..."
echo
print_info "API地址: http://localhost:8000"
print_info "API文档: http://localhost:8000/docs"
echo

# 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
