from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Dict, List
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from app.models import Parrot
from app.schemas import StatisticsOverview
from app.core import get_db

router = APIRouter(prefix="/api", tags=["统计分析"])


@router.get("/statistics", response_model=StatisticsOverview, summary="获取统计概览")
def get_statistics_overview(db: Session = Depends(get_db)):
    """
    获取统计概览数据

    Returns:
        包含以下统计数据的字典:
        - total_parrots: 总数量
        - available_parrots: 未售数量
        - sold_parrots: 已售数量
        - returned_parrots: 退货数量
        - breed_counts: 品种统计
        - total_revenue: 总收入
    """
    # 基础统计
    total_parrots = db.query(Parrot).count()
    available_parrots = db.query(Parrot).filter(Parrot.status == "available").count()
    sold_parrots = db.query(Parrot).filter(Parrot.status == "sold").count()
    returned_parrots = db.query(Parrot).filter(Parrot.status == "returned").count()

    # 品种统计
    breed_stats = (
        db.query(Parrot.breed, func.count(Parrot.id))
        .group_by(Parrot.breed)
        .all()
    )
    breed_counts: Dict[str, int] = {breed: count for breed, count in breed_stats}

    # 总收入统计 (已售的)
    total_revenue_result = (
        db.query(func.sum(Parrot.price))
        .filter(Parrot.status == "sold")
        .scalar()
    )
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0

    return StatisticsOverview(
        total_parrots=total_parrots,
        available_parrots=available_parrots,
        sold_parrots=sold_parrots,
        returned_parrots=returned_parrots,
        breed_counts=breed_counts,
        total_revenue=total_revenue,
    )


@router.get("/statistics/monthly-sales", summary="获取月度销售数据")
def get_monthly_sales(db: Session = Depends(get_db)):
    """
    获取月度销售数据，用于图表展示

    Returns:
        {
            "monthly_sales": [
                {
                    "month": "2024-01",  # 格式: YYYY-MM
                    "month_name": "1月",
                    "count": 10,         # 销售数量
                    "revenue": 5000.00   # 销售额
                },
                ...
            ]
        }
    """
    # 获取过去12个月的数据
    end_date = datetime.now().replace(day=1)  # 当前月第一天
    start_date = end_date - relativedelta(months=11)  # 11个月前

    monthly_data = []

    # 循环获取每个月的销售数据
    current_date = start_date
    while current_date <= end_date:
        # 当前月份的第一天和最后一天
        month_start = current_date.replace(day=1)
        if current_date.month == 12:
            month_end = current_date.replace(year=current_date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = current_date.replace(month=current_date.month + 1, day=1) - timedelta(days=1)

        # 统计该月的销售数据
        monthly_sales = (
            db.query(func.count(Parrot.id), func.sum(Parrot.price))
            .filter(Parrot.status == "sold")
            .filter(Parrot.sold_at >= month_start)
            .filter(Parrot.sold_at <= month_end)
            .first()
        )

        count = monthly_sales[0] if monthly_sales[0] else 0
        revenue = float(monthly_sales[1]) if monthly_sales[1] else 0.0

        monthly_data.append({
            "month": current_date.strftime("%Y-%m"),
            "month_name": f"{current_date.month}月",
            "count": count,
            "revenue": revenue
        })

        # 移动到下一个月
        current_date = current_date + relativedelta(months=1)

    return {
        "monthly_sales": monthly_data
    }
