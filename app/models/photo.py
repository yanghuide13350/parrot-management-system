from datetime import datetime
from app.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    parrot_id = Column(Integer, ForeignKey("parrots.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String(500), nullable=False, comment="文件存储路径")
    file_name = Column(String(255), nullable=False, comment="原始文件名")
    file_type = Column(String(20), nullable=False, default="image", comment="文件类型: image/video")
    sort_order = Column(Integer, nullable=False, default=0, comment="排序权重")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # 关联鹦鹉
    parrot = relationship("Parrot", back_populates="photos")
