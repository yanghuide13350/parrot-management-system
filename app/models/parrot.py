from datetime import datetime
from app.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Date, Numeric, Text, ForeignKey, func
from sqlalchemy.orm import relationship


class Parrot(Base):
    __tablename__ = "parrots"

    id = Column(Integer, primary_key=True, index=True)
    breed = Column(String(100), nullable=False, index=True, comment="品种")
    price = Column(Numeric(precision=10, scale=2), nullable=True, comment="价格")
    min_price = Column(Numeric(precision=10, scale=2), nullable=True, comment="最低价格")
    max_price = Column(Numeric(precision=10, scale=2), nullable=True, comment="最高价格")
    gender = Column(String(10), nullable=False, comment="公母")
    birth_date = Column(Date, nullable=True, comment="出生日期")
    ring_number = Column(String(100), unique=True, nullable=True, comment="圈号")
    status = Column(String(20), nullable=False, default="available", index=True, comment="状态: available/sold/returned/breeding")
    health_notes = Column(Text, nullable=True, comment="健康备注")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    sold_at = Column(DateTime, nullable=True, comment="销售时间")
    returned_at = Column(DateTime, nullable=True, comment="退货时间")
    return_reason = Column(String(500), nullable=True, comment="退货原因")

    # 配对相关字段
    mate_id = Column(Integer, ForeignKey("parrots.id"), nullable=True, comment="配偶ID")
    paired_at = Column(DateTime, nullable=True, comment="配对时间")

    # 销售信息字段
    seller = Column(String(100), nullable=True, comment="售卖人")
    buyer_name = Column(String(100), nullable=True, comment="购买者姓名")
    sale_price = Column(Numeric(precision=10, scale=2), nullable=True, comment="实际销售价格")
    contact = Column(String(100), nullable=True, comment="联系方式（微信号或电话）")
    follow_up_status = Column(String(20), default="pending", comment="回访状态: pending/completed/no_contact")
    sale_notes = Column(Text, nullable=True, comment="销售备注")

    # 关联照片
    photos = relationship("Photo", back_populates="parrot", cascade="all, delete-orphan")
    # 自引用关系，用于配对
    mate = relationship("Parrot", foreign_keys=[mate_id], remote_side=[id], back_populates="paired_parrots")
    paired_parrots = relationship("Parrot", foreign_keys=[mate_id], back_populates="mate")
    # 关联回访记录
    follow_ups = relationship("FollowUp", back_populates="parrot", cascade="all, delete-orphan")
    # 关联销售历史记录
    sales_history = relationship("SalesHistory", back_populates="parrot", cascade="all, delete-orphan")
