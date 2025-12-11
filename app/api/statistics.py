from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Dict, List

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
