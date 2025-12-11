from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.models import Photo, Parrot
from app.schemas import PhotoResponse
from app.core import get_db, NotFoundException, BadRequestException
from app.utils import FileUploadUtil

router = APIRouter(prefix="/api/photos", tags=["照片管理"])


@router.post("/upload", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED, summary="上传照片")
async def upload_photo(
    file: UploadFile = File(...),
    parrot_id: Optional[int] = Form(None),
    sort_order: Optional[int] = Form(0),
    db: Session = Depends(get_db),
):
    """
    上传鹦鹉照片

    Args:
        file: 上传的文件
        parrot_id: 关联的鹦鹉ID (可选)
        sort_order: 排序权重
    """
    if not file:
        raise BadRequestException("请选择要上传的文件")

    if parrot_id:
        parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()
        if not parrot:
            raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    file_path, original_filename = await FileUploadUtil.upload_photo(file, subfolder="parrots")

    photo = Photo(
        parrot_id=parrot_id,
        file_path=file_path,
        file_name=original_filename,
        sort_order=sort_order,
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return PhotoResponse(
        id=photo.id,
        parrot_id=photo.parrot_id,
        file_path=photo.file_path,
        file_name=photo.file_name,
        sort_order=photo.sort_order,
        created_at=photo.created_at.isoformat(),
    )


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT, summary="删除照片")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    """
    删除照片，同时删除物理文件
    """
    photo = db.query(Photo).filter(Photo.id == photo_id).first()

    if not photo:
        raise NotFoundException(f"未找到ID为 {photo_id} 的照片")

    file_path = photo.file_path

    db.delete(photo)
    db.commit()

    FileUploadUtil.delete_file(file_path)

    return None


@router.put("/{photo_id}/sort", summary="更新照片排序")
def update_photo_sort(
    photo_id: int, sort_order: int = Form(...), db: Session = Depends(get_db)
):
    """
    更新照片的排序权重
    """
    photo = db.query(Photo).filter(Photo.id == photo_id).first()

    if not photo:
        raise NotFoundException(f"未找到ID为 {photo_id} 的照片")

    photo.sort_order = sort_order
    db.commit()
    db.refresh(photo)

    return {
        "id": photo.id,
        "parrot_id": photo.parrot_id,
        "file_path": photo.file_path,
        "file_name": photo.file_name,
        "sort_order": photo.sort_order,
        "created_at": photo.created_at.isoformat(),
    }
