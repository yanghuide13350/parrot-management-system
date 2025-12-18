from app.schemas.parrot import *
from app.schemas.photo import *
from app.schemas.statistics import *
from app.schemas.incubation import *

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
]
