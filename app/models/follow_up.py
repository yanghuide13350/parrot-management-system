from datetime import datetime
from app.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    parrot_id = Column(Integer, ForeignKey("parrots.id"), nullable=False, comment="鹦鹉ID")
    follow_up_date = Column(DateTime, nullable=False, default=datetime.utcnow, comment="回访日期")
    follow_up_status = Column(String(20), nullable=False, comment="回访状态: pending/completed/no_contact")
    notes = Column(Text, nullable=True, comment="回访备注")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联鹦鹉
    parrot = relationship("Parrot", back_populates="follow_ups")

    def __repr__(self):
        return f"<FollowUp(id={self.id}, parrot_id={self.parrot_id}, status={self.follow_up_status})>"
