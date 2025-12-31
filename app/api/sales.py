from typing import Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models import Parrot, SalesHistory, Photo
from app.schemas import SaleRecordResponse, SaleRecordList
from app.core import get_db

router = APIRouter(prefix="/api", tags=["销售管理"])


@router.get("/sales-records", response_model=SaleRecordList, summary="获取销售记录列表")
def get_sales_records(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    keyword: Optional[str] = Query(None, description="搜索关键词(客户姓名/圈号)"),
    breed: Optional[str] = Query(None, description="筛选品种"),
    payment_method: Optional[str] = Query(None, description="支付方式"),
    start_date: Optional[str] = Query(None, description="销售开始日期(ISO格式)"),
    end_date: Optional[str] = Query(None, description="销售结束日期(ISO格式)"),
):
    """
    获取销售记录列表(当前在售的鹦鹉)
    
    **数据来源**: Parrot表中status=sold的记录
    
    **筛选参数**:
    - keyword: 搜索客户姓名或圈号
    - breed: 按品种筛选
    - payment_method: 按支付方式筛选
    - start_date/end_date: 按销售日期范围筛选
    
    **返回数据**:
    - 鹦鹉基本信息（品种、圈号、性别）
    - 销售信息（售卖人、购买者、价格、日期）
    - 回访状态
    - 支持分页
    """
    # 查询构建 - 只查询已售出的鹦鹉
    query = db.query(Parrot).filter(Parrot.status == "sold")

    # 关键词搜索(客户姓名或圈号)
    if keyword:
        query = query.filter(
            or_(
                Parrot.buyer_name.contains(keyword) if Parrot.buyer_name else False,
                Parrot.ring_number.contains(keyword) if Parrot.ring_number else False
            )
        )

    # 品种筛选
    if breed:
        query = query.filter(Parrot.breed.contains(breed))

    # 支付方式筛选 (注意: 当前Parrot表没有payment_method字段,这个功能需要扩展)
    # if payment_method:
    #     query = query.filter(Parrot.payment_method == payment_method)

    # 日期范围筛选
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Parrot.sold_at >= start_dt)
        except ValueError:
            pass  # 忽略无效日期

    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Parrot.sold_at <= end_dt)
        except ValueError:
            pass  # 忽略无效日期

    # 统计总数
    total = query.count()

    # 分页
    offset = (page - 1) * size
    parrots = query.order_by(Parrot.sold_at.desc()).offset(offset).limit(size).all()

    # 构建响应
    items = []
    for parrot in parrots:
        # Get first photo
        first_photo = db.query(Photo).filter(Photo.parrot_id == parrot.id).order_by(Photo.sort_order.desc(), Photo.created_at.asc()).first()
        photo_url = f"/uploads/{first_photo.file_path}" if first_photo else None

        items.append(SaleRecordResponse(
            id=parrot.id,
            parrot_id=parrot.id,
            seller=parrot.seller,
            buyer_name=parrot.buyer_name,
            sale_price=float(parrot.sale_price) if parrot.sale_price else None,
            contact=parrot.contact,
            follow_up_status=parrot.follow_up_status or "pending",
            sale_notes=parrot.sale_notes,
            sale_date=parrot.sold_at.isoformat() if parrot.sold_at else None,
            payment_method=None,  # TODO: 需要在Parrot表添加payment_method字段
            photo_url=photo_url,
            created_at=parrot.created_at.isoformat() if parrot.created_at else None,
            updated_at=parrot.updated_at.isoformat() if parrot.updated_at else None,
            parrot={
                "breed": parrot.breed,
                "ring_number": parrot.ring_number,
                "gender": parrot.gender,
            }
        ))

    return SaleRecordList(total=total, items=items, page=page, size=size)



@router.get("/sales-history", summary="获取销售历史记录列表")
def get_sales_history(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    keyword: Optional[str] = Query(None, description="搜索关键词(客户姓名/圈号)"),
    has_return: Optional[bool] = Query(None, description="是否已退货"),
):
    """
    获取销售历史记录列表
    
    **数据来源**: SalesHistory表
    
    **筛选参数**:
    - keyword: 搜索客户姓名或圈号
    - has_return: 
      - true: 只返回已退货的记录
      - false: 只返回未退货的记录
      - null: 返回所有记录
    
    **返回数据**:
    - 鹦鹉基本信息
    - 销售信息（售卖人、购买者、价格、日期）
    - 退货信息（退货日期、退货原因）
    - 支持分页
    
    **使用场景**:
    - 查询退货历史：has_return=true
    - 查询完整销售历史：不传has_return参数
    """
    # 查询构建
    query = db.query(SalesHistory)

    # 关键词搜索
    if keyword:
        # 需要join Parrot表来搜索圈号
        query = query.join(Parrot, SalesHistory.parrot_id == Parrot.id)
        query = query.filter(
            or_(
                SalesHistory.buyer_name.contains(keyword),
                Parrot.ring_number.contains(keyword) if Parrot.ring_number else False
            )
        )

    # 是否已退货筛选
    if has_return is not None:
        if has_return:
            query = query.filter(SalesHistory.return_date.isnot(None))
        else:
            query = query.filter(SalesHistory.return_date.is_(None))

    # 统计总数
    total = query.count()

    # 分页
    offset = (page - 1) * size
    sales_history = query.order_by(SalesHistory.sale_date.desc()).offset(offset).limit(size).all()

    # 构建响应
    items = []
    for history in sales_history:
        # 获取关联的鹦鹉信息
        parrot = db.query(Parrot).filter(Parrot.id == history.parrot_id).first()
        
        items.append({
            "id": history.id,
            "parrot_id": history.parrot_id,
            "parrot": {
                "id": parrot.id if parrot else None,
                "breed": parrot.breed if parrot else None,
                "gender": parrot.gender if parrot else None,
                "ring_number": parrot.ring_number if parrot else None,
            } if parrot else None,
            "seller": history.seller,
            "buyer_name": history.buyer_name,
            "sale_price": float(history.sale_price) if history.sale_price else 0,
            "contact": history.contact,
            "follow_up_status": history.follow_up_status,
            "sale_notes": history.sale_notes,
            "sale_date": history.sale_date.isoformat() if history.sale_date else None,
            "return_date": history.return_date.isoformat() if history.return_date else None,
            "return_reason": history.return_reason,
            "created_at": history.created_at.isoformat() if history.created_at else None,
            "updated_at": history.updated_at.isoformat() if history.updated_at else None,
        })

    return {
        "total": total,
        "items": items,
        "page": page,
        "size": size
    }
