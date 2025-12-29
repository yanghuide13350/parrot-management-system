from app.schemas.parrot import *
from app.schemas.photo import *
from app.schemas.statistics import *
from app.schemas.incubation import *
from app.schemas.share import *

__all__ = [
    "ParrotCreate",
    "ParrotUpdate",
    "ParrotResponse",
    "ParrotList",
    "ParrotStatusUpdate",
    "ParrotSaleUpdate",
    "SaleInfoResponse",
    "ParrotPairRequest",
    "MateInfo",
    "FollowUpCreate",
    "FollowUpResponse",
    "FollowUpList",
    "ParrotReturnUpdate",
    "PhotoUpload",
    "PhotoResponse",
    "StatisticsOverview",
    "IncubationRecordCreate",
    "IncubationRecordUpdate",
    "IncubationRecordResponse",
    "IncubationRecordList",
    "IncubationRecordFilter",
    "IncubationStatistics",
    "ParrotInfo",
    "ShareLinkResponse",
    "ShareDataResponse",
    "ParrotShareInfo",
    "PhotoInfo",
    "ShareLinkListResponse",
]
