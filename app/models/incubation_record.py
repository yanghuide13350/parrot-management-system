from sqlalchemy import Column, Integer, String, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class IncubationRecord(Base):
    __tablename__ = "incubation_records"

    id = Column(Integer, primary_key=True, index=True, comment="主键ID")
    father_id = Column(Integer, ForeignKey("parrots.id"), nullable=False, comment="父亲鹦鹉ID")
    mother_id = Column(Integer, ForeignKey("parrots.id"), nullable=False, comment="母亲鹦鹉ID")
    start_date = Column(Date, nullable=False, comment="孵化开始日期")
    expected_hatch_date = Column(Date, nullable=False, comment="预计孵化日期")
    actual_hatch_date = Column(Date, nullable=True, comment="实际孵化日期")
    eggs_count = Column(Integer, default=0, comment="蛋的数量")
    hatched_count = Column(Integer, default=0, comment="成功孵化数量")
    status = Column(String(50), default="incubating", comment="孵化状态：incubating孵化中/hatched已孵化/completed已完成/failed失败")
    notes = Column(Text, nullable=True, comment="备注信息")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关联关系
    father = relationship("Parrot", foreign_keys=[father_id])
    mother = relationship("Parrot", foreign_keys=[mother_id])
