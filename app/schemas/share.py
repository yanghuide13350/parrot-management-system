from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class ShareLinkResponse(BaseModel):
    """分享链接响应"""
    id: int
    token: str
    url: str
    created_at: str
    expires_at: str
    remaining_days: int

    class Config:
        from_attributes = True


class PhotoInfo(BaseModel):
    """照片信息（用于分享页面）"""
    id: int
    file_path: str
    file_name: str
    file_type: str  # 'image' or 'video'


class ParrotShareInfo(BaseModel):
    """鹦鹉分享信息（用于分享页面，不包含敏感信息）"""
    id: int
    breed: str
    gender: str
    price: Optional[float] = None
    birth_date: Optional[str] = None
    ring_number: Optional[str] = None
    health_notes: Optional[str] = None
    status: str


class ShareDataResponse(BaseModel):
    """分享数据响应"""
    status: str  # "valid", "expired", "invalid"
    parrot: Optional[ParrotShareInfo] = None
    photos: Optional[List[PhotoInfo]] = None
    message: Optional[str] = None


class ShareLinkListResponse(BaseModel):
    """分享链接列表响应"""
    total: int
    items: List[ShareLinkResponse]
