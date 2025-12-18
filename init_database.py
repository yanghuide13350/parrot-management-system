#!/usr/bin/env python3
"""
数据库初始化脚本
用于创建数据库表结构和初始数据
"""

import os
import sys
import logging
from sqlalchemy import text

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, test_connection, init_db
from app.core.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def init_database():
    """初始化数据库"""
    logger.info("开始初始化数据库...")

    # 测试数据库连接
    logger.info("测试数据库连接...")
    if not test_connection():
        logger.error("数据库连接失败，请检查配置")
        return False

    # 初始化表结构
    logger.info("创建数据库表...")
    try:
        init_db()
        logger.info("数据库表创建成功")
    except Exception as e:
        logger.error(f"数据库表创建失败: {e}")
        return False

    # 验证表是否创建成功
    logger.info("验证数据库表...")
    try:
        with engine.connect() as conn:
            # 检查主要表是否存在
            tables_to_check = [
                'parrots',
                'photos',
                'incubation_records',
                'chicks',
                'follow_ups',
                'sales_history'
            ]

            for table_name in tables_to_check:
                if settings.DATABASE_URL.startswith("sqlite"):
                    result = conn.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"))
                elif settings.DATABASE_URL.startswith("mysql"):
                    result = conn.execute(text(f"SHOW TABLES LIKE '{table_name}'"))
                elif settings.DATABASE_URL.startswith("postgresql"):
                    result = conn.execute(text(f"SELECT tablename FROM pg_tables WHERE tablename='{table_name}'"))

                if result.fetchone():
                    logger.info(f"  ✓ 表 {table_name} 存在")
                else:
                    logger.warning(f"  ✗ 表 {table_name} 不存在")

    except Exception as e:
        logger.error(f"验证数据库表失败: {e}")
        return False

    logger.info("数据库初始化完成！")
    return True


def main():
    """主函数"""
    print("=" * 50)
    print("鹦鹉管理系统 - 数据库初始化工具")
    print("=" * 50)
    print(f"数据库类型: {settings.DATABASE_URL.split('://')[0]}")
    print(f"数据库URL: {settings.DATABASE_URL[:50]}...")
    print()

    if init_database():
        print("\n" + "=" * 50)
        print("✓ 数据库初始化成功！")
        print("=" * 50)
        return 0
    else:
        print("\n" + "=" * 50)
        print("✗ 数据库初始化失败！")
        print("=" * 50)
        return 1


if __name__ == "__main__":
    sys.exit(main())
