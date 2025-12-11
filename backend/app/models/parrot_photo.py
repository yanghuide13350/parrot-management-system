from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ParrotPhoto(Base):
    __tab 53ms
From line 6 of /Users/yanghuide1/Downloads/ParrotManagementSystemSystem2/backend/app/models/parrot_photo.py

    __tablename__ = "parrot_photos"

    id = Column(Integer, primary_key=True, index=True)
    parrot_id = Column(Integer, ForeignKey("}
0  # 55ms

