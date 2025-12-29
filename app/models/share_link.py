from datetime import datetime
from app.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship


class ShareLink(Base):
    """分享链接模型，用于存储鹦鹉的公开分享链接"""
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    parrot_id = Column(Integer, ForeignKey("parrots.id", ondelete="CASCADE"), nullable=False, index=True, comment="关联的鹦鹉ID")
    token = Column(String(64), unique=True, nullable=False, index=True, comment="唯一分享令牌")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, comment="创建时间")
    expires_at = Column(DateTime, nullable=False, comment="过期时间")
    is_active = Column(Boolean, default=True, nullable=False, comment="是否有效（用于软删除）")

    # 关联鹦鹉
    parrot = relationship("Parrot", back_populates="share_links")
