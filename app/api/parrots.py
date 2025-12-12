from typing import List, Optional
from decimal import Decimal
from datetime import date, datetime

from fastapi import APIRouter, Depends, Query, HTTPException, status, File, UploadFile
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models import Parrot, Photo, FollowUp
from app.schemas import (
    ParrotCreate,
    ParrotUpdate,
    ParrotResponse,
    ParrotList,
    ParrotStatusUpdate,
    ParrotPairRequest,
    ParrotSaleUpdate,
    SaleInfoResponse,
    FollowUpCreate,
    FollowUpResponse,
    FollowUpList,
    ParrotReturnUpdate,
)
from app.core import get_db, NotFoundException, BadRequestException

from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/api/parrots", tags=["鹦鹉管理"])


@router.get("", response_model=ParrotList, summary="获取鹦鹉列表")
def get_parrots(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    breed: Optional[str] = Query(None, description="筛选品种"),
    gender: Optional[str] = Query(None, description="筛选性别"),
    status: Optional[str] = Query(None, description="筛选状态"),
    min_age_days: Optional[int] = Query(None, ge=0, description="最小年龄(天)"),
    max_age_days: Optional[int] = Query(None, ge=0, description="最大年龄(天)"),
    min_price: Optional[float] = Query(None, ge=0, description="最低价格"),
    max_price: Optional[float] = Query(None, ge=0, description="最高价格"),
    keyword: Optional[str] = Query(None, description="搜索关键词(品种/圈号)"),
):
    """
    获取鹦鹉列表，支持筛选和分页
    """
    # 查询构建
    query = db.query(Parrot)

    # 筛选条件
    if breed:
        query = query.filter(Parrot.breed.contains(breed))

    if gender:
        query = query.filter(Parrot.gender == gender)

    if status:
        query = query.filter(Parrot.status == status)

    if min_age_days is not None:
        min_date = date.today()
        query = query.filter(Parrot.birth_date <= min_date)

    if max_age_days is not None:
        max_date = date.today()
        query = query.filter(Parrot.birth_date >= max_date)

    if min_price is not None:
        query = query.filter(Parrot.price >= min_price)

    if max_price is not None:
        query = query.filter(Parrot.price <= max_price)

    if keyword:
        query = query.filter(
            or_(
                Parrot.breed.contains(keyword),
                Parrot.ring_number.contains(keyword) if Parrot.ring_number else False
            )
        )

    # 统计总数
    total = query.count()

    # 分页
    offset = (page - 1) * size
    parrots = query.order_by(Parrot.created_at.desc()).offset(offset).limit(size).all()

    # 构建响应
    items = []
    for parrot in parrots:
        photo_count = db.query(Photo).filter(Photo.parrot_id == parrot.id).count()

        # 转换datetime为字符串
        created_at_str = parrot.created_at.isoformat() if parrot.created_at else None
        updated_at_str = parrot.updated_at.isoformat() if parrot.updated_at else None

        items.append(
            ParrotResponse(
                id=parrot.id,
                breed=parrot.breed,
                price=parrot.price,
                gender=parrot.gender,
                birth_date=parrot.birth_date,
                ring_number=parrot.ring_number,
                status=parrot.status,
                health_notes=parrot.health_notes,
                created_at=created_at_str,
                updated_at=updated_at_str,
                photo_count=photo_count,
            )
        )

    return ParrotList(total=total, items=items, page=page, size=size)


@router.get("/{parrot_id}", response_model=ParrotResponse, summary="获取鹦鹉详情")
def get_parrot(parrot_id: int, db: Session = Depends(get_db)):
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    photo_count = db.query(Photo).filter(Photo.parrot_id == parrot.id).count()

    # 转换datetime为字符串
    created_at_str = parrot.created_at.isoformat() if parrot.created_at else None
    updated_at_str = parrot.updated_at.isoformat() if parrot.updated_at else None

    return ParrotResponse(
        id=parrot.id,
        breed=parrot.breed,
        price=parrot.price,
        gender=parrot.gender,
        birth_date=parrot.birth_date,
        ring_number=parrot.ring_number,
        status=parrot.status,
        health_notes=parrot.health_notes,
        created_at=created_at_str,
        updated_at=updated_at_str,
        photo_count=photo_count,
    )


@router.get("/ring-number/{ring_number}/exists", summary="检查圈号是否已存在")
def check_ring_number(ring_number: str, db: Session = Depends(get_db)):
    exists = db.query(Parrot.id).filter(Parrot.ring_number == ring_number).first() is not None
    return {"exists": exists}


@router.post("", response_model=ParrotResponse, status_code=status.HTTP_201_CREATED, summary="创建鹦鹉")
def create_parrot(parrot_data: ParrotCreate = None, db: Session = Depends(get_db)):
    if parrot_data is None:
        raise BadRequestException("创建鹦鹉失败: 请求体不能为空")

    if (
        parrot_data.min_price is not None
        and parrot_data.max_price is not None
        and parrot_data.min_price > parrot_data.max_price
    ):
        raise BadRequestException("最低价格不能高于最高价格")

    # 创建鹦鹉对象
    parrot = Parrot(
        breed=parrot_data.breed,
        price=parrot_data.price or parrot_data.max_price or parrot_data.min_price,
        min_price=parrot_data.min_price,
        max_price=parrot_data.max_price,
        gender=parrot_data.gender,
        birth_date=parrot_data.birth_date,
        ring_number=parrot_data.ring_number,
        health_notes=parrot_data.health_notes,
        status="available",
    )

    db.add(parrot)

    try:
        db.flush()
        db.commit()
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e)
        print(f"IntegrityError: {error_msg}")  # 添加日志
        if "ring_number" in error_msg or "UNIQUE" in error_msg:
            raise BadRequestException(f"圈号 {parrot_data.ring_number} 已存在，请使用其他圈号")
        raise BadRequestException(f"创建鹦鹉失败: {error_msg}")
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        print(f"Exception: {error_msg}")  # 添加日志
        raise BadRequestException(f"创建鹦鹉失败: {error_msg}")

    db.refresh(parrot)

    # 转换datetime为字符串
    created_at_str = parrot.created_at.isoformat() if parrot.created_at else None
    updated_at_str = parrot.updated_at.isoformat() if parrot.updated_at else None

    return ParrotResponse(
        id=parrot.id,
        breed=parrot.breed,
        price=parrot.price,
        gender=parrot.gender,
        birth_date=parrot.birth_date,
        ring_number=parrot.ring_number,
        status=parrot.status,
        health_notes=parrot.health_notes,
        created_at=created_at_str,
        updated_at=updated_at_str,
        photo_count=0,
    )


@router.put("/{parrot_id}", response_model=ParrotResponse, summary="更新鹦鹉信息")
def update_parrot(
    parrot_id: int, parrot_data: ParrotUpdate, db: Session = Depends(get_db)
):
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    # 更新字段
    update_data = parrot_data.model_dump(exclude_unset=True)

    target_min_price = update_data.get("min_price", parrot.min_price)
    target_max_price = update_data.get("max_price", parrot.max_price)

    if (
        target_min_price is not None
        and target_max_price is not None
        and target_min_price > target_max_price
    ):
        raise BadRequestException("最低价格不能高于最高价格")

    for field, value in update_data.items():
        if value is not None:
            setattr(parrot, field, value)

    if "price" not in update_data:
        parrot.price = target_max_price or target_min_price or parrot.price

    try:
        db.commit()
        db.refresh(parrot)
    except IntegrityError as e:
        db.rollback()
        if "ring_number" in str(e) and "UNIQUE constraint failed" in str(e):
            raise BadRequestException(f"圈号 {parrot_data.ring_number} 已存在")
        raise BadRequestException(f"更新失败: {str(e)}")
    except Exception as e:
        db.rollback()
        raise BadRequestException(f"更新失败: {str(e)}")

    photo_count = db.query(Photo).filter(Photo.parrot_id == parrot.id).count()

    # 转换datetime为字符串
    created_at_str = parrot.created_at.isoformat() if parrot.created_at else None
    updated_at_str = parrot.updated_at.isoformat() if parrot.updated_at else None

    return ParrotResponse(
        id=parrot.id,
        breed=parrot.breed,
        price=parrot.price,
        gender=parrot.gender,
        birth_date=parrot.birth_date,
        ring_number=parrot.ring_number,
        status=parrot.status,
        health_notes=parrot.health_notes,
        created_at=created_at_str,
        updated_at=updated_at_str,
        photo_count=photo_count,
    )


@router.delete("/{parrot_id}", status_code=status.HTTP_204_NO_CONTENT, summary="删除鹦鹉")
def delete_parrot(parrot_id: int, db: Session = Depends(get_db)):
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    db.delete(parrot)
    db.commit()

    return None


@router.put("/{parrot_id}/status", response_model=ParrotResponse, summary="更新鹦鹉状态")
def update_parrot_status(
    parrot_id: int, status_data: ParrotStatusUpdate, db: Session = Depends(get_db)
):
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    parrot.status = status_data.status
    db.commit()
    db.refresh(parrot)

    photo_count = db.query(Photo).filter(Photo.parrot_id == parrot.id).count()

    # 转换datetime为字符串
    created_at_str = parrot.created_at.isoformat() if parrot.created_at else None
    updated_at_str = parrot.updated_at.isoformat() if parrot.updated_at else None

    return ParrotResponse(
        id=parrot.id,
        breed=parrot.breed,
        price=parrot.price,
        gender=parrot.gender,
        birth_date=parrot.birth_date,
        ring_number=parrot.ring_number,
        status=parrot.status,
        health_notes=parrot.health_notes,
        created_at=created_at_str,
        updated_at=updated_at_str,
        photo_count=photo_count,
    )


@router.get("/{parrot_id}/photos", summary="获取鹦鹉的所有照片")
def get_parrot_photos(parrot_id: int, db: Session = Depends(get_db)):
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    photos = db.query(Photo).filter(Photo.parrot_id == parrot_id).order_by(Photo.sort_order, Photo.created_at).all()

    return [{"id": p.id, "file_path": p.file_path, "file_name": p.file_name, "file_type": p.file_type, "sort_order": p.sort_order} for p in photos]


@router.post("/{parrot_id}/photos", status_code=status.HTTP_201_CREATED, summary="上传鹦鹉照片或视频")
async def upload_parrot_photo(
    parrot_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """上传鹦鹉照片或视频"""
    from app.utils import FileUploadUtil

    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()
    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    if not file:
        raise BadRequestException("请选择要上传的文件")

    file_path, original_filename = await FileUploadUtil.upload_photo(file, subfolder="parrots")

    # 根据文件扩展名判断文件类型
    file_ext = original_filename.split('.')[-1].lower()
    video_exts = {'mp4', 'mov', 'avi', 'mkv', 'webm'}
    file_type = 'video' if file_ext in video_exts else 'image'

    photo = Photo(
        parrot_id=parrot_id,
        file_path=file_path,
        file_name=original_filename,
        file_type=file_type,
        sort_order=0,
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {
        "id": photo.id,
        "parrot_id": photo.parrot_id,
        "file_path": photo.file_path,
        "file_name": photo.file_name,
        "file_type": photo.file_type,
        "sort_order": photo.sort_order,
        "created_at": photo.created_at.isoformat() if photo.created_at else None,
    }


@router.get("/{parrot_id}/mate", summary="获取鹦鹉配偶信息")
def get_parrot_mate(parrot_id: int, db: Session = Depends(get_db)):
    """获取鹦鹉的配偶信息"""
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    if not parrot.mate_id:
        return {"has_mate": False}

    mate = db.query(Parrot).filter(Parrot.id == parrot.mate_id).first()
    if not mate:
        return {"has_mate": False}

    return {
        "has_mate": True,
        "mate": {
            "id": mate.id,
            "breed": mate.breed,
            "gender": mate.gender,
            "ring_number": mate.ring_number,
            "birth_date": mate.birth_date.isoformat() if mate.birth_date else None,
        },
        "paired_at": parrot.paired_at.isoformat() if parrot.paired_at else None,
    }


@router.post("/pair", summary="配对两只鹦鹉")
def pair_parrots(pair_data: ParrotPairRequest, db: Session = Depends(get_db)):
    """将两只鹦鹉配对"""
    male = db.query(Parrot).filter(Parrot.id == pair_data.male_id).first()
    female = db.query(Parrot).filter(Parrot.id == pair_data.female_id).first()

    if not male:
        raise NotFoundException(f"未找到ID为 {pair_data.male_id} 的公鹦鹉")
    if not female:
        raise NotFoundException(f"未找到ID为 {pair_data.female_id} 的母鹦鹉")

    if male.gender != "公":
        raise BadRequestException("只能选择公鹦鹉作为配偶")
    if female.gender != "母":
        raise BadRequestException("只能选择母鹦鹉作为配偶")

    if male.status != "breeding":
        raise BadRequestException("只有种鸟状态的公鹦鹉才能配对")
    if female.status != "breeding":
        raise BadRequestException("只有种鸟状态的母鹦鹉才能配对")

    if male.mate_id:
        raise BadRequestException(f"公鹦鹉已与其他鹦鹉配对")
    if female.mate_id:
        raise BadRequestException(f"母鹦鹉已与其他鹦鹉配对")

    from datetime import datetime

    # 设置配对关系
    male.mate_id = female.id
    male.paired_at = datetime.utcnow()
    female.mate_id = male.id
    female.paired_at = datetime.utcnow()

    db.commit()
    db.refresh(male)
    db.refresh(female)

    return {
        "success": True,
        "message": f"{male.breed} (圈号: {male.ring_number}) 与 {female.breed} (圈号: {female.ring_number}) 配对成功",
        "male": male,
        "female": female,
    }


@router.get("/eligible-females/{male_id}", summary="获取指定公鹦鹉的可配对母鹦鹉")
def get_eligible_females(male_id: int, db: Session = Depends(get_db)):
    """获取指定公鹦鹉的所有可配对母鹦鹉（不局限于同品种）"""
    male = db.query(Parrot).filter(Parrot.id == male_id).first()

    if not male:
        raise NotFoundException(f"未找到ID为 {male_id} 的鹦鹉")

    if male.gender != "公":
        raise BadRequestException("只能为公鹦鹉查找可配对的母鹦鹉")

    # 获取所有未配对的种鸟母鹦鹉（不局限于同品种）
    eligible_females = db.query(Parrot).filter(
        Parrot.gender == "母",
        Parrot.status == "breeding",
        Parrot.mate_id.is_(None),
        Parrot.id != male_id,
    ).all()

    return [
        {
            "id": f.id,
            "breed": f.breed,
            "gender": f.gender,
            "ring_number": f.ring_number,
            "birth_date": f.birth_date.isoformat() if f.birth_date else None,
            "health_notes": f.health_notes,
        }
        for f in eligible_females
    ]


@router.post("/unpair/{parrot_id}", summary="取消配对")
def unpair_parrot(parrot_id: int, db: Session = Depends(get_db)):
    """取消鹦鹉的配对关系"""
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    if not parrot.mate_id:
        raise BadRequestException("该鹦鹉未配对")

    mate = db.query(Parrot).filter(Parrot.id == parrot.mate_id).first()

    if mate:
        mate.mate_id = None
        mate.paired_at = None

    parrot.mate_id = None
    parrot.paired_at = None

    db.commit()

    return {
        "success": True,
        "message": "取消配对成功",
    }


@router.put("/{parrot_id}/sale-info", response_model=SaleInfoResponse, summary="更新鹦鹉销售信息")
def update_parrot_sale_info(
    parrot_id: int,
    sale_data: ParrotSaleUpdate,
    db: Session = Depends(get_db)
):
    """更新鹦鹉的销售信息"""
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    # 更新销售信息
    parrot.seller = sale_data.seller
    parrot.buyer_name = sale_data.buyer_name
    parrot.sale_price = sale_data.sale_price
    parrot.contact = sale_data.contact
    parrot.follow_up_status = sale_data.follow_up_status
    parrot.sale_notes = sale_data.notes
    parrot.status = "sold"
    parrot.sold_at = datetime.utcnow()

    db.commit()
    db.refresh(parrot)

    return SaleInfoResponse(
        seller=parrot.seller,
        buyer_name=parrot.buyer_name,
        sale_price=float(parrot.sale_price) if parrot.sale_price else 0,
        contact=parrot.contact,
        follow_up_status=parrot.follow_up_status,
        notes=parrot.sale_notes
    )


@router.get("/{parrot_id}/sale-info", response_model=SaleInfoResponse, summary="获取鹦鹉销售信息")
def get_parrot_sale_info(parrot_id: int, db: Session = Depends(get_db)):
    """获取鹦鹉的销售信息"""
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    if parrot.status != "sold" or not parrot.seller:
        # 如果没有销售信息，返回默认值
        return SaleInfoResponse(
            seller="-",
            buyer_name="-",
            sale_price=float(parrot.price) if parrot.price else 0,
            contact="-",
            follow_up_status="pending",
            notes=None
        )

    return SaleInfoResponse(
        seller=parrot.seller,
        buyer_name=parrot.buyer_name,
        sale_price=float(parrot.sale_price) if parrot.sale_price else 0,
        contact=parrot.contact,
        follow_up_status=parrot.follow_up_status,
        notes=parrot.sale_notes
    )


@router.post("/{parrot_id}/follow-ups", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED, summary="创建回访记录")
def create_follow_up(parrot_id: int, follow_up_data: FollowUpCreate, db: Session = Depends(get_db)):
    """为鹦鹉创建回访记录"""
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    # 创建回访记录
    follow_up = FollowUp(
        parrot_id=parrot_id,
        follow_up_status=follow_up_data.follow_up_status,
        notes=follow_up_data.notes
    )

    db.add(follow_up)
    db.commit()
    db.refresh(follow_up)

    # 更新鹦鹉的回访状态
    parrot.follow_up_status = follow_up_data.follow_up_status
    db.commit()

    return FollowUpResponse(
        id=follow_up.id,
        parrot_id=follow_up.parrot_id,
        follow_up_date=follow_up.follow_up_date.isoformat() if follow_up.follow_up_date else None,
        follow_up_status=follow_up.follow_up_status,
        notes=follow_up.notes,
        created_at=follow_up.created_at.isoformat() if follow_up.created_at else None,
        updated_at=follow_up.updated_at.isoformat() if follow_up.updated_at else None,
    )


@router.get("/{parrot_id}/follow-ups", response_model=FollowUpList, summary="获取鹦鹉的回访记录")
def get_parrot_follow_ups(
    parrot_id: int,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
):
    """获取鹦鹉的所有回访记录"""
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    # 查询回访记录
    query = db.query(FollowUp).filter(FollowUp.parrot_id == parrot_id)

    total = query.count()

    offset = (page - 1) * size
    follow_ups = query.order_by(FollowUp.follow_up_date.desc()).offset(offset).limit(size).all()

    items = []
    for follow_up in follow_ups:
        items.append(
            FollowUpResponse(
                id=follow_up.id,
                parrot_id=follow_up.parrot_id,
                follow_up_date=follow_up.follow_up_date.isoformat() if follow_up.follow_up_date else None,
                follow_up_status=follow_up.follow_up_status,
                notes=follow_up.notes,
                created_at=follow_up.created_at.isoformat() if follow_up.created_at else None,
                updated_at=follow_up.updated_at.isoformat() if follow_up.updated_at else None,
            )
        )

    return FollowUpList(total=total, items=items, page=page, size=size)


@router.put("/{parrot_id}/return", response_model=ParrotResponse, summary="处理退货")
def return_parrot(parrot_id: int, return_data: ParrotReturnUpdate, db: Session = Depends(get_db)):
    """处理鹦鹉退货"""
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    if parrot.status != "sold":
        raise BadRequestException("只能退货已售出的鹦鹉")

    # 记录退货信息
    parrot.returned_at = datetime.utcnow()
    parrot.return_reason = return_data.return_reason

    # 清除当前销售相关信息（但保留sold_at用于时间线显示）
    parrot.seller = None
    parrot.buyer_name = None
    parrot.sale_price = None
    parrot.contact = None
    parrot.follow_up_status = "pending"
    parrot.sale_notes = None
    # 保留sold_at字段用于时间线显示销售记录

    # 退货后状态变为待售（重新上架）
    parrot.status = "available"

    db.commit()
    db.refresh(parrot)

    photo_count = db.query(Photo).filter(Photo.parrot_id == parrot.id).count()

    # 转换datetime为字符串
    created_at_str = parrot.created_at.isoformat() if parrot.created_at else None
    updated_at_str = parrot.updated_at.isoformat() if parrot.updated_at else None
    sold_at_str = parrot.sold_at.isoformat() if parrot.sold_at else None
    returned_at_str = parrot.returned_at.isoformat() if parrot.returned_at else None

    return ParrotResponse(
        id=parrot.id,
        breed=parrot.breed,
        price=parrot.price,
        min_price=parrot.min_price,
        max_price=parrot.max_price,
        gender=parrot.gender,
        birth_date=parrot.birth_date,
        ring_number=parrot.ring_number,
        health_notes=parrot.health_notes,
        sold_at=sold_at_str,
        returned_at=returned_at_str,
        return_reason=parrot.return_reason,
        mate_id=parrot.mate_id,
        paired_at=parrot.paired_at,
        status=parrot.status,
        created_at=created_at_str,
        updated_at=updated_at_str,
        photo_count=photo_count,
    )


@router.get("/{parrot_id}/sales-timeline", summary="获取销售流程时间线")
def get_sales_timeline(parrot_id: int, db: Session = Depends(get_db)):
    """获取鹦鹉的销售流程时间线"""
    parrot = db.query(Parrot).filter(Parrot.id == parrot_id).first()

    if not parrot:
        raise NotFoundException(f"未找到ID为 {parrot_id} 的鹦鹉")

    timeline = []

    # 1. 出生信息
    if parrot.birth_date:
        timeline.append({
            "event": "出生",
            "date": parrot.birth_date.isoformat(),
            "description": f"鹦鹉出生",
            "type": "birth"
        })

    # 2. 录入系统时间
    if parrot.created_at:
        timeline.append({
            "event": "录入系统",
            "date": parrot.created_at.isoformat(),
            "description": f"鹦鹉信息录入系统",
            "type": "system"
        })

    # 3. 销售信息（检查是否有销售记录，即使当前状态不是sold）
    if parrot.sold_at:
        # 如果当前字段被清除（退货后），尝试从回访记录中推断销售信息
        seller = parrot.seller or "未知"
        buyer_name = parrot.buyer_name or "未知"
        sale_price = float(parrot.sale_price) if parrot.sale_price else 0
        contact = parrot.contact or "未知"

        sale_info = {
            "event": "销售",
            "date": parrot.sold_at.isoformat(),
            "description": f"售卖人: {seller}, 购买者: {buyer_name}, 价格: ¥{sale_price:.2f}",
            "type": "sale",
            "details": {
                "seller": seller,
                "buyer_name": buyer_name,
                "sale_price": sale_price,
                "contact": contact,
                "follow_up_status": parrot.follow_up_status,
                "notes": parrot.sale_notes
            }
        }
        timeline.append(sale_info)

    # 4. 退货信息（检查是否有退货记录）
    if parrot.returned_at:
        timeline.append({
            "event": "退货",
            "date": parrot.returned_at.isoformat(),
            "description": f"退货原因: {parrot.return_reason}",
            "type": "return"
        })

    # 5. 回访记录（按时间顺序）
    follow_ups = db.query(FollowUp).filter(FollowUp.parrot_id == parrot_id).order_by(FollowUp.follow_up_date).all()
    for follow_up in follow_ups:
        timeline.append({
            "event": "回访",
            "date": follow_up.follow_up_date.isoformat() if follow_up.follow_up_date else follow_up.created_at.isoformat(),
            "description": f"回访状态: {follow_up.follow_up_status}, 备注: {follow_up.notes or '无'}",
            "type": "follow_up",
            "details": {
                "follow_up_status": follow_up.follow_up_status,
                "notes": follow_up.notes
            }
        })

    # 按时间排序（从早到晚）
    timeline.sort(key=lambda x: x["date"])

    return {
        "parrot_id": parrot_id,
        "timeline": timeline
    }
