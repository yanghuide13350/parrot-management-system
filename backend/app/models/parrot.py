from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Parrot(Base):
    __tablename__ = "parrots"

    id = Column(Integer, primary_key=True, index=True)
    species = Column(String(100), nullable=False, comment="品种")
    age = Column(String(50), nullable=False, comment="年龄")
    age_unit = Column(Enum("month", "year", name="age_unit_enum"), nullable=False, comment="年龄单位")
    gender = Column(Enum("male", "female", "unknown", name="gender_enum"), nullable=False, comment="性别")
    price = Column(Float, nullable=False, comment="价格")
    enclosure_number = Column(Integer, nullable=False, comment="圈号")
    status = Column(Enum("available", "sold", "returned", name="parrot_status_enum"), default="available", index=True, comment="销售状态")
    description = Column(Text, nullable=True, comment="描述")
    created_at = Column(DateTime, default=datetime.now, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment="更新时间")
    sold_at = Column(DateTime, nullable=True, comment="销售时间")
    returned_at = Column(DateTime, nullable=True, comment="退货时间")
    return_reason = Column(String(500), nullable=True, comment="退货原因")

    photos = relationship("ParrotPhoto", back_populates="parrot", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Parrot(id={self.id}, species={self.species}, status={self.status})>"
