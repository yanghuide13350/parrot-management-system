from pydantic import BaseModel
from typing import Dict


class StatisticsOverview(BaseModel):
    """统计概览响应"""
    total_parrots: int
    available_parrots: int
    sold_parrots: int
    returned_parrots: int
    breed_counts: Dict[str, int]
    total_revenue: float

    class Config:
        from_attributes = True
