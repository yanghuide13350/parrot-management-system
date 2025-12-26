from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_serializer


class IncubationRecordBase(BaseModel):
    """孵化记录基础模型"""
    father_id: Optional[int] = Field(None, description="父亲鹦鹉ID，为空表示未知")
    mother_id: Optional[int] = Field(None, description="母亲鹦鹉ID，为空表示未知")
    start_date: date = Field(..., description="孵化开始日期")
    expected_hatch_date: date = Field(..., description="预计孵化日期")
    actual_hatch_date: Optional[date] = Field(None, description="实际孵化日期")
    eggs_count: int = Field(default=0, ge=0, description="蛋的数量")
    hatched_count: int = Field(default=0, ge=0, description="成功孵化数量")
    status: str = Field(default="incubating", pattern="^(incubating|hatched|failed)$", description="孵化状态")
    notes: Optional[str] = Field(None, description="备注信息")


class IncubationRecordCreate(IncubationRecordBase):
    """创建孵化记录请求"""
    pass


class IncubationRecordUpdate(BaseModel):
    """更新孵化记录请求"""
    father_id: Optional[int] = Field(None, description="父亲鹦鹉ID")
    mother_id: Optional[int] = Field(None, description="母亲鹦鹉ID")
    start_date: Optional[date] = Field(None, description="孵化开始日期")
    expected_hatch_date: Optional[date] = Field(None, description="预计孵化日期")
    actual_hatch_date: Optional[date] = Field(None, description="实际孵化日期")
    eggs_count: Optional[int] = Field(None, ge=0, description="蛋的数量")
    hatched_count: Optional[int] = Field(None, ge=0, description="成功孵化数量")
    status: Optional[str] = Field(None, pattern="^(incubating|hatched|failed)$", description="孵化状态")
    notes: Optional[str] = Field(None, description="备注信息")


class ParrotInfo(BaseModel):
    """鹦鹉基本信息"""
    id: int
    breed: str
    ring_number: Optional[str] = None
    gender: str

    class Config:
        from_attributes = True


class IncubationRecordResponse(BaseModel):
    """孵化记录详情响应"""
    id: int
    father_id: Optional[int] = None
    mother_id: Optional[int] = None
    start_date: str
    expected_hatch_date: str
    actual_hatch_date: Optional[str] = None
    eggs_count: int
    hatched_count: int
    status: str
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    father: Optional[ParrotInfo] = None
    mother: Optional[ParrotInfo] = None

    class Config:
        from_attributes = True


class IncubationRecordList(BaseModel):
    """孵化记录列表响应"""
    total: int
    items: List[IncubationRecordResponse]
    page: int
    size: int


class IncubationRecordFilter(BaseModel):
    """孵化记录筛选参数"""
    status: Optional[str] = Field(None, pattern="^(incubating|hatched|failed)$", description="孵化状态")
    start_date_from: Optional[date] = Field(None, description="开始日期起始")
    start_date_to: Optional[date] = Field(None, description="开始日期结束")
    father_ring_number: Optional[str] = Field(None, description="父亲圈号")
    mother_ring_number: Optional[str] = Field(None, description="母亲圈号")
    page: int = Field(default=1, ge=1, description="页码")
    size: int = Field(default=20, ge=1, le=100, description="每页数量")


class IncubationStatistics(BaseModel):
    """孵化统计信息"""
    total_records: int
    incubating_count: int
    hatched_count: int
    failed_count: int
    total_eggs: int
    total_hatched: int
    hatch_rate: float


class IncubationRecordWithStats(IncubationRecordResponse):
    """包含统计信息的孵化记录"""
    pass
