"""分享链接API模块"""
import secrets
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.models import Parrot, Photo, ShareLink
from app.schemas import (
    ShareLinkResponse,
    ShareDataResponse,
    ParrotShareInfo,
    PhotoInfo,
    ShareLinkListResponse,
)
from app.core import get_db, NotFoundException, BadRequestException

router = APIRouter(prefix="/api/share", tags=["分享管理"])

# 默认有效期（天）
DEFAULT_EXPIRY_DAYS = 7


def generate_token() -> str:
    """生成唯一的分享令牌（至少16字符）"""
    return secrets.token_urlsafe(16)  # 生成22字符的URL安全token


def calculate_remaining_days(expires_at: datetime) -> int:
    """计算剩余有效天数"""
    now = datetime.utcnow()
    if expires_at <= now:
        return 0
    delta = expires_at - now
    return max(0, delta.days)


@router.post("/generate/{parrot_id}", response_model=ShareLinkResponse, summary="生成分享链接")
def generate_share_link(
    parrot_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    为指定鹦鹉生成分享链接
    - 生成唯一的token
    - 设置7天有效期
    - 返回完整的分享URL（指向前端页面）
    """
    # 验证鹦鹉存在
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()
    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    # 生成唯一token（最多重试3次）
    token = None
    for _ in range(3):
        candidate = generate_token()
        existing = db.query(ShareLink).filter(ShareLink.token == candidate).first()
        if not existing:
            token = candidate
            break
    
    if not token:
        raise BadRequestException("生成分享链接失败，请重试")

    # 计算过期时间
    now = datetime.utcnow()
    expires_at = now + timedelta(days=DEFAULT_EXPIRY_DAYS)

    # 创建分享链接记录
    share_link = ShareLink(
        parrot_id=parrot_id,
        token=token,
        created_at=now,
        expires_at=expires_at,
        is_active=True
    )
    db.add(share_link)
    db.commit()
    db.refresh(share_link)

    # 构建完整URL - 使用配置的前端URL
    from app.core.config import settings
    frontend_base = settings.FRONTEND_URL.rstrip('/')
    
    share_url = f"{frontend_base}/share/{token}"

    return ShareLinkResponse(
        id=share_link.id,
        token=token,
        url=share_url,
        created_at=share_link.created_at.isoformat(),
        expires_at=share_link.expires_at.isoformat(),
        remaining_days=calculate_remaining_days(share_link.expires_at)
    )


@router.get("/{token}", response_model=ShareDataResponse, summary="获取分享数据")
def get_share_data(token: str, db: Session = Depends(get_db)):
    """
    根据token获取分享数据（公开接口）
    - 验证token有效性
    - 检查是否过期
    - 返回鹦鹉信息和媒体列表
    """
    # 查找分享链接
    share_link = db.query(ShareLink).filter(ShareLink.token == token).first()
    
    if not share_link:
        return ShareDataResponse(
            status="invalid",
            message="链接无效"
        )

    # 检查是否已删除（软删除）
    if not share_link.is_active:
        return ShareDataResponse(
            status="invalid",
            message="链接已失效"
        )

    # 检查是否过期
    now = datetime.utcnow()
    if share_link.expires_at <= now:
        return ShareDataResponse(
            status="expired",
            message="链接已过期"
        )

    # 获取鹦鹉信息
    parrot = db.query(Parrot).filter(Parrot.id == share_link.parrot_id).first()
    if not parrot:
        return ShareDataResponse(
            status="invalid",
            message="鹦鹉信息不存在"
        )

    # 获取照片/视频列表
    photos = db.query(Photo).filter(Photo.parrot_id == parrot.id).order_by(Photo.sort_order, Photo.created_at).all()

    # 构建响应
    parrot_info = ParrotShareInfo(
        id=parrot.id,
        breed=parrot.breed,
        gender=parrot.gender,
        price=float(parrot.price) if parrot.price else None,
        birth_date=parrot.birth_date.isoformat() if parrot.birth_date else None,
        ring_number=parrot.ring_number,
        health_notes=parrot.health_notes,
        status=parrot.status
    )

    photo_list = [
        PhotoInfo(
            id=p.id,
            file_path=p.file_path,
            file_name=p.file_name,
            file_type=p.file_type or 'image'
        )
        for p in photos
    ]

    return ShareDataResponse(
        status="valid",
        parrot=parrot_info,
        photos=photo_list
    )


@router.get("/list/{parrot_id}", response_model=ShareLinkListResponse, summary="获取分享链接列表")
def get_share_links(
    parrot_id: int,
    db: Session = Depends(get_db)
):
    """
    获取指定鹦鹉的所有有效分享链接
    """
    # 验证鹦鹉存在
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()
    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    # 获取所有有效且未过期的链接
    now = datetime.utcnow()
    share_links = db.query(ShareLink).filter(
        ShareLink.parrot_id == parrot_id,
        ShareLink.is_active == True,
        ShareLink.expires_at > now
    ).order_by(ShareLink.created_at.desc()).all()

    from app.core.config import settings
    frontend_base = settings.FRONTEND_URL.rstrip('/')

    items = [
        ShareLinkResponse(
            id=link.id,
            token=link.token,
            url=f"{frontend_base}/share/{link.token}",
            created_at=link.created_at.isoformat(),
            expires_at=link.expires_at.isoformat(),
            remaining_days=calculate_remaining_days(link.expires_at)
        )
        for link in share_links
    ]

    return ShareLinkListResponse(
        total=len(items),
        items=items
    )


@router.delete("/{token}", summary="删除分享链接")
def delete_share_link(token: str, db: Session = Depends(get_db)):
    """
    删除（使失效）指定的分享链接
    """
    share_link = db.query(ShareLink).filter(ShareLink.token == token).first()
    
    if not share_link:
        raise NotFoundException("分享链接不存在")

    # 软删除
    share_link.is_active = False
    db.commit()

    return {
        "success": True,
        "message": "分享链接已删除"
    }
