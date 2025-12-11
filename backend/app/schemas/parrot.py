from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, validator
from .parrot_photo import ParrotPhotoResponse


class ParrotBase(BaseModel):
    species: str = Field(..., max_length=100, description="品种")
    age: str = Field(..., max_length=50, description="年龄")
    age_unit: str = Field(..., regex="^(month|year)$", description="年龄单位: month 或 year")
    gender: str = Field(..., regex="^(male|female|unknown)$", description="性别: male, female, unknown")
    price: float = Field(..., ge=0, description="价格")
    enclosure_number: int = Field(..., ge=1, description="圈号")
    status: str = Field("available", regex="^(available|sold|returned)$", description="状态")
    description: Optional[str] = Field(None, description="描述")

    @validator("age")
    def validate_age(cls, v):
        import re
        if not re.match(r"^\d+(\.\d+)?$", v):
            raise ValueError("年龄必须是数字格式")
        return v

    class Config:
        schema_extra = {
            "example": {
                "species": "金刚鹦鹉",
                "age": "2",
                "age_unit": "year",
                "gender": "male",
                "price": 3500.00, 54
        }
        }
        }


class ParrotCreate(ParrotBase):
    pass


class ParrotUpdate(BaseModel):
    species: Optional[str] = Field(None, max_length=100)
    age: Optional[str] = Field(None, max_length=50)
    age_unit: Optional[str] = Field(None, regex="^(month|year)$")
    gender: Optional[str] = Field(None, regex="^(male|female|unknown)$")
    price: Optional[float] = Field(None, ge=0)
    enclosure_number: Optional[int] = Field(None, ge=1)
    status: Optional[str] = Field(None, regex="^(available|sold|returned)$")
    description: Optional[str]


class ParrotResponse(ParrotBase):
    id: int
    created_at: datetime
    updated_at: datetime
    sold_at: Optional[datetime]
    returned_at: Optional[datetime]
    return_reason: Optional[str]
    photos: List[ParrotPhotoResponse] = []

    class Config:
        orm_mode = True


class ParrotFilters(BaseModel):
    species: Optional[str] = None
    age_min: Optional[float] = None
    age_max: Optional[float] = None
    age_unit: Optional[str] = Field(None, regex="^(month|year)$")
    gender: Optional[str] = Field(None, regex="^(male|female|unknown)$")
    status: Optional[str] = Field(None, regex="^(available|sold|returned)$")
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    enclosure_number: Optional[int] = None


class ParrotListResponse(BaseModel):
    total: int
    items: List[ParrotResponse]
    skip: int
    limit: int
