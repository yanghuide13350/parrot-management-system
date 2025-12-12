from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class SalesHistory(Base):
    __tablename__ = "sales_history"

    id = Column(Integer, primary_key=True, index=True, comment="主键ID")
    parrot_id = Column(Integer, ForeignKey("parrots.id"), nullable=False, comment="鹦鹉ID")
    seller = Column(String(100), nullable=False, comment="售卖人")
    buyer_name = Column(String(100), nullable=False, comment="购买者姓名")
    sale_price = Column(Numeric(precision=10, scale=2), nullable=False, comment="销售价格")
    contact = Column(String(100), nullable=False, comment="联系方式")
    follow_up_status = Column(String(20), default="pending", comment="回访状态")
    sale_notes = Column(Text, nullable=True, comment="销售备注")
    sale_date = Column(DateTime, nullable=False, comment="销售时间")
    return_date = Column(DateTime, nullable=True, comment="退货时间")
    return_reason = Column(String(500), nullable=True, comment="退货原因")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关联关系
    parrot = relationship("Parrot", back_populates="sales_history")
