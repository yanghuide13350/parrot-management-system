from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, field_serializer


class ParrotBase(BaseModel):
    breed: str = Field(..., min_length=1, max_length=100, description="品种")
    price: Optional[Decimal] = Field(None, ge=0, description="价格")
    min_price: Optional[Decimal] = Field(None, ge=0, description="最低价格")
    max_price: Optional[Decimal] = Field(None, ge=0, description="最高价格")
    gender: str = Field(..., pattern="^(公|母|未验卡)$", description="性别: 公/母/未验卡")
    birth_date: Optional[date] = Field(None, description="出生日期")
    ring_number: Optional[str] = Field(None, max_length=100, description="圈号")
    health_notes: Optional[str] = Field(None, description="健康备注")
    sold_at: Optional[datetime] = Field(None, description="销售时间")
    returned_at: Optional[datetime] = Field(None, description="退货时间")
    return_reason: Optional[str] = Field(None, max_length=500, description="退货原因")
    mate_id: Optional[int] = Field(None, description="配偶ID")
    paired_at: Optional[datetime] = Field(None, description="配对时间")

    @field_serializer('price')
    def serialize_price(self, price: Decimal, _info):
        return float(price)


class ParrotCreate(ParrotBase):
    """创建鹦鹉请求"""
    pass


class ParrotUpdate(BaseModel):
    """更新鹦鹉请求"""
    breed: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, ge=0)
    min_price: Optional[Decimal] = Field(None, ge=0)
    max_price: Optional[Decimal] = Field(None, ge=0)
    gender: Optional[str] = Field(None, pattern="^(公|母|未验卡)$")
    birth_date: Optional[date] = None
    ring_number: Optional[str] = Field(None, max_length=100)
    health_notes: Optional[str] = None


class ParrotStatusUpdate(BaseModel):
    """更新鹦鹉状态请求"""
    status: str = Field(..., pattern="^(available|sold|returned|breeding)$", description="状态: available/sold/returned/breeding")


class ParrotPairRequest(BaseModel):
    """配对请求"""
    male_id: int = Field(..., description="公鹦鹉ID")
    female_id: int = Field(..., description="母鹦鹉ID")


class MateInfo(BaseModel):
    """配偶信息"""
    id: int
    breed: str
    gender: str
    ring_number: Optional[str] = None
    birth_date: Optional[date] = None

    class Config:
        from_attributes = True


class ParrotResponse(ParrotBase):
    """鹦鹉详情响应"""
    id: int
    status: str
    created_at: str
    updated_at: str
    photo_count: int

    class Config:
        from_attributes = True


class ParrotResponseWithMate(ParrotResponse):
    """包含配偶信息的鹦鹉详情响应"""
    mate: Optional[MateInfo] = None
    paired_at: Optional[str] = None


class ParrotList(BaseModel):
    """鹦鹉列表响应"""
    total: int
    items: List[ParrotResponse]
    page: int
    size: int
