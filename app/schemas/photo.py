from pydantic import BaseModel
from typing import Optional


class PhotoBase(BaseModel):
    file_name: str
    file_path: str
    sort_order: Optional[int] = 0


class PhotoUpload(BaseModel):
    pass


class PhotoResponse(PhotoBase):
    id: int
    parrot_id: int
    created_at: str

    class Config:
        from_attributes = True
