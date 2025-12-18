from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from app.models import Parrot, IncubationRecord
from app.schemas import (
    IncubationRecordCreate,
    IncubationRecordUpdate,
    IncubationRecordResponse,
    IncubationRecordList,
    IncubationRecordFilter,
    IncubationStatistics,
)
from app.core import get_db, NotFoundException, BadRequestException

router = APIRouter(prefix="/api/incubation", tags=["孵化管理"])


@router.get("", response_model=IncubationRecordList, summary="获取孵化记录列表")
def get_incubation_records(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    status: Optional[str] = Query(None, description="筛选状态"),
    start_date_from: Optional[date] = Query(None, description="开始日期起始"),
    start_date_to: Optional[date] = Query(None, description="开始日期结束"),
    father_ring_number: Optional[str] = Query(None, description="父亲圈号"),
    mother_ring_number: Optional[str] = Query(None, description="母亲圈号"),
):
    """
    获取孵化记录列表，支持筛选和分页
    """
    # 查询构建
    query = db.query(IncubationRecord)

    # 筛选条件
    if status:
        query = query.filter(IncubationRecord.status == status)

    if start_date_from:
        query = query.filter(IncubationRecord.start_date >= start_date_from)

    if start_date_to:
        query = query.filter(IncubationRecord.start_date <= start_date_to)

    # 处理圈号搜索（父鸟或母鸟）
    if father_ring_number or mother_ring_number:
        # 使用别名避免冲突
        father_alias = Parrot.alias('father')
        mother_alias = Parrot.alias('mother')

        # 构建 OR 条件：匹配父鸟或母鸟的圈号
        conditions = []
        if father_ring_number:
            conditions.append(father_alias.ring_number.contains(father_ring_number))
        if mother_ring_number:
            conditions.append(mother_alias.ring_number.contains(mother_ring_number))

        # 需要 JOIN 两次（父子和母）
        query = query.join(father_alias, IncubationRecord.father_id == father_alias.id)
        query = query.join(mother_alias, IncubationRecord.mother_id == mother_alias.id)

        # 应用 OR 条件
        query = query.filter(or_(*conditions))

    # 统计总数
    total = query.count()

    # 分页
    offset = (page - 1) * size
    records = query.order_by(IncubationRecord.created_at.desc()).offset(offset).limit(size).all()

    # 构建响应
    items = []
    for record in records:
        # 转换datetime为字符串
        created_at_str = record.created_at.isoformat() if record.created_at else None
        updated_at_str = record.updated_at.isoformat() if record.updated_at else None

        # 格式化日期
        start_date_str = record.start_date.isoformat() if record.start_date else None
        expected_hatch_date_str = record.expected_hatch_date.isoformat() if record.expected_hatch_date else None
        actual_hatch_date_str = record.actual_hatch_date.isoformat() if record.actual_hatch_date else None

        items.append(
            IncubationRecordResponse(
                id=record.id,
                father_id=record.father_id,
                mother_id=record.mother_id,
                start_date=start_date_str,
                expected_hatch_date=expected_hatch_date_str,
                actual_hatch_date=actual_hatch_date_str,
                eggs_count=record.eggs_count,
                hatched_count=record.hatched_count,
                status=record.status,
                notes=record.notes,
                created_at=created_at_str,
                updated_at=updated_at_str,
                father=record.father,
                mother=record.mother,
            )
        )

    return IncubationRecordList(total=total, items=items, page=page, size=size)


@router.get("/{record_id}", response_model=IncubationRecordResponse, summary="获取孵化记录详情")
def get_incubation_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(IncubationRecord).filter(IncubationRecord.id == record_id).first()

    if not record:
        raise NotFoundException(f"未找到ID为 {record_id} 的孵化记录")

    # 转换datetime为字符串
    created_at_str = record.created_at.isoformat() if record.created_at else None
    updated_at_str = record.updated_at.isoformat() if record.updated_at else None

    # 格式化日期
    start_date_str = record.start_date.isoformat() if record.start_date else None
    expected_hatch_date_str = record.expected_hatch_date.isoformat() if record.expected_hatch_date else None
    actual_hatch_date_str = record.actual_hatch_date.isoformat() if record.actual_hatch_date else None

    return IncubationRecordResponse(
        id=record.id,
        father_id=record.father_id,
        mother_id=record.mother_id,
        start_date=start_date_str,
        expected_hatch_date=expected_hatch_date_str,
        actual_hatch_date=actual_hatch_date_str,
        eggs_count=record.eggs_count,
        hatched_count=record.hatched_count,
        status=record.status,
        notes=record.notes,
        created_at=created_at_str,
        updated_at=updated_at_str,
        father=record.father,
        mother=record.mother,
    )


@router.post("", response_model=IncubationRecordResponse, status_code=status.HTTP_201_CREATED, summary="创建孵化记录")
def create_incubation_record(record: IncubationRecordCreate, db: Session = Depends(get_db)):
    """
    创建新的孵化记录
    """
    # 验证父亲鹦鹉存在
    father = db.query(Parrot).filter(Parrot.id == record.father_id).first()
    if not father:
        raise BadRequestException(f"未找到ID为 {record.father_id} 的父亲鹦鹉")

    # 验证母亲鹦鹉存在
    mother = db.query(Parrot).filter(Parrot.id == record.mother_id).first()
    if not mother:
        raise BadRequestException(f"未找到ID为 {record.mother_id} 的母亲鹦鹉")

    # 验证父亲性别
    if father.gender != "公":
        raise BadRequestException(f"父亲鹦鹉必须是公的，当前性别：{father.gender}")

    # 验证母亲性别
    if mother.gender != "母":
        raise BadRequestException(f"母亲鹦鹉必须是母的，当前性别：{mother.gender}")

    # 验证日期逻辑
    if record.expected_hatch_date < record.start_date:
        raise BadRequestException("预计孵化日期不能早于开始日期")

    # 创建记录
    db_record = IncubationRecord(
        father_id=record.father_id,
        mother_id=record.mother_id,
        start_date=record.start_date,
        expected_hatch_date=record.expected_hatch_date,
        actual_hatch_date=record.actual_hatch_date,
        eggs_count=record.eggs_count,
        hatched_count=record.hatched_count,
        status=record.status,
        notes=record.notes,
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    # 转换datetime为字符串
    created_at_str = db_record.created_at.isoformat() if db_record.created_at else None
    updated_at_str = db_record.updated_at.isoformat() if db_record.updated_at else None

    # 格式化日期
    start_date_str = db_record.start_date.isoformat() if db_record.start_date else None
    expected_hatch_date_str = db_record.expected_hatch_date.isoformat() if db_record.expected_hatch_date else None
    actual_hatch_date_str = db_record.actual_hatch_date.isoformat() if db_record.actual_hatch_date else None

    return IncubationRecordResponse(
        id=db_record.id,
        father_id=db_record.father_id,
        mother_id=db_record.mother_id,
        start_date=start_date_str,
        expected_hatch_date=expected_hatch_date_str,
        actual_hatch_date=actual_hatch_date_str,
        eggs_count=db_record.eggs_count,
        hatched_count=db_record.hatched_count,
        status=db_record.status,
        notes=db_record.notes,
        created_at=created_at_str,
        updated_at=updated_at_str,
        father=db_record.father,
        mother=db_record.mother,
    )


@router.put("/{record_id}", response_model=IncubationRecordResponse, summary="更新孵化记录")
def update_incubation_record(
    record_id: int,
    record_update: IncubationRecordUpdate,
    db: Session = Depends(get_db),
):
    """
    更新孵化记录
    """
    db_record = db.query(IncubationRecord).filter(IncubationRecord.id == record_id).first()

    if not db_record:
        raise NotFoundException(f"未找到ID为 {record_id} 的孵化记录")

    # 更新字段
    update_data = record_update.dict(exclude_unset=True)

    # 特殊验证：如果更新父亲或母亲，需要验证性别
    if "father_id" in update_data:
        father = db.query(Parrot).filter(Parrot.id == update_data["father_id"]).first()
        if not father:
            raise BadRequestException(f"未找到ID为 {update_data['father_id']} 的父亲鹦鹉")
        if father.gender != "公":
            raise BadRequestException(f"父亲鹦鹉必须是公的，当前性别：{father.gender}")

    if "mother_id" in update_data:
        mother = db.query(Parrot).filter(Parrot.id == update_data["mother_id"]).first()
        if not mother:
            raise BadRequestException(f"未找到ID为 {update_data['mother_id']} 的母亲鹦鹉")
        if mother.gender != "母":
            raise BadRequestException(f"母亲鹦鹉必须是母的，当前性别：{mother.gender}")

    # 验证日期逻辑
    if "start_date" in update_data and "expected_hatch_date" in update_data:
        if update_data["expected_hatch_date"] < update_data["start_date"]:
            raise BadRequestException("预计孵化日期不能早于开始日期")
    elif "start_date" in update_data and not "expected_hatch_date" in update_data:
        if db_record.expected_hatch_date < update_data["start_date"]:
            raise BadRequestException("预计孵化日期不能早于开始日期")
    elif "expected_hatch_date" in update_data and not "start_date" in update_data:
        if update_data["expected_hatch_date"] < db_record.start_date:
            raise BadRequestException("预计孵化日期不能早于开始日期")

    # 应用更新
    for field, value in update_data.items():
        setattr(db_record, field, value)

    db.commit()
    db.refresh(db_record)

    # 转换datetime为字符串
    created_at_str = db_record.created_at.isoformat() if db_record.created_at else None
    updated_at_str = db_record.updated_at.isoformat() if db_record.updated_at else None

    # 格式化日期
    start_date_str = db_record.start_date.isoformat() if db_record.start_date else None
    expected_hatch_date_str = db_record.expected_hatch_date.isoformat() if db_record.expected_hatch_date else None
    actual_hatch_date_str = db_record.actual_hatch_date.isoformat() if db_record.actual_hatch_date else None

    return IncubationRecordResponse(
        id=db_record.id,
        father_id=db_record.father_id,
        mother_id=db_record.mother_id,
        start_date=start_date_str,
        expected_hatch_date=expected_hatch_date_str,
        actual_hatch_date=actual_hatch_date_str,
        eggs_count=db_record.eggs_count,
        hatched_count=db_record.hatched_count,
        status=db_record.status,
        notes=db_record.notes,
        created_at=created_at_str,
        updated_at=updated_at_str,
        father=db_record.father,
        mother=db_record.mother,
    )


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT, summary="删除孵化记录")
def delete_incubation_record(record_id: int, db: Session = Depends(get_db)):
    """
    删除孵化记录
    """
    db_record = db.query(IncubationRecord).filter(IncubationRecord.id == record_id).first()

    if not db_record:
        raise NotFoundException(f"未找到ID为 {record_id} 的孵化记录")

    db.delete(db_record)
    db.commit()

    return None


@router.get("/statistics/summary", response_model=IncubationStatistics, summary="获取孵化统计信息")
def get_incubation_statistics(db: Session = Depends(get_db)):
    """
    获取孵化统计信息
    """
    # 统计各种状态的记录数
    total_records = db.query(IncubationRecord).count()
    incubating_count = db.query(IncubationRecord).filter(IncubationRecord.status == "incubating").count()
    hatched_count = db.query(IncubationRecord).filter(IncubationRecord.status == "hatched").count()
    failed_count = db.query(IncubationRecord).filter(IncubationRecord.status == "failed").count()

    # 统计蛋的数量和孵化数量
    total_eggs = db.query(func.sum(IncubationRecord.eggs_count)).scalar() or 0
    total_hatched = db.query(func.sum(IncubationRecord.hatched_count)).scalar() or 0

    # 计算孵化率
    hatch_rate = (total_hatched / total_eggs * 100) if total_eggs > 0 else 0

    return IncubationStatistics(
        total_records=total_records,
        incubating_count=incubating_count,
        hatched_count=hatched_count,
        failed_count=failed_count,
        total_eggs=total_eggs,
        total_hatched=total_hatched,
        hatch_rate=round(hatch_rate, 2),
    )
