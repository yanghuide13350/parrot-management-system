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
    def serialize_price(self, price: Optional[Decimal], _info):
        return float(price) if price is not None else None


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
    status: str = Field(..., pattern="^(available|sold|returned|breeding|incubating|paired)$", description="状态: available/sold/returned/breeding/incubating/paired")


class ParrotSaleUpdate(BaseModel):
    """鹦鹉销售信息更新请求"""
    seller: str = Field(..., min_length=1, max_length=100, description="售卖人")
    buyer_name: str = Field(..., min_length=1, max_length=100, description="购买者姓名")
    sale_price: Decimal = Field(..., ge=0, description="销售价格")
    contact: str = Field(..., min_length=1, max_length=100, description="联系方式（微信号或电话）")
    follow_up_status: str = Field(default="pending", pattern="^(pending|completed|no_contact)$", description="回访状态")
    notes: Optional[str] = Field(None, description="备注")


class SaleInfoResponse(BaseModel):
    """销售信息响应"""
    seller: str
    buyer_name: str
    sale_price: float
    contact: str
    follow_up_status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


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
    photo_url: Optional[str] = None

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


class FollowUpCreate(BaseModel):
    """创建回访记录请求"""
    follow_up_status: str = Field(..., pattern="^(pending|completed|no_contact)$", description="回访状态")
    notes: Optional[str] = Field(None, description="回访备注")


class FollowUpResponse(BaseModel):
    """回访记录响应"""
    id: int
    parrot_id: int
    follow_up_date: str
    follow_up_status: str
    notes: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class FollowUpList(BaseModel):
    """回访记录列表响应"""
    total: int
    items: List[FollowUpResponse]
    page: int
    size: int


class ParrotReturnUpdate(BaseModel):
    """鹦鹉退货请求"""
    return_reason: str = Field(..., min_length=1, max_length=500, description="退货原因")


class SaleRecordResponse(BaseModel):
    """销售记录响应"""
    id: int
    parrot_id: int
    seller: Optional[str] = None
    buyer_name: Optional[str] = None
    sale_price: Optional[float] = None
    contact: Optional[str] = None
    follow_up_status: Optional[str] = "pending"
    sale_notes: Optional[str] = None
    sale_date: Optional[str] = None  # sold_at
    payment_method: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: str
    updated_at: str
    parrot: Optional[dict] = None  # 包含breed, ring_number, gender

    class Config:
        from_attributes = True


class SaleRecordList(BaseModel):
    """销售记录列表响应"""
    total: int
    items: List[SaleRecordResponse]
    page: int
    size: int
