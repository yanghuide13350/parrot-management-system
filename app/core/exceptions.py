from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request


class ParrotManagementException(Exception):
    """自定义异常基类"""
    pass


class NotFoundException(ParrotManagementException):
    """资源未找到异常"""
    def __init__(self, message: str = "资源未找到"):
        self.message = message
        super().__init__(self.message)


class BadRequestException(ParrotManagementException):
    """请求参数异常"""
    def __init__(self, message: str = "请求参数错误"):
        self.message = message
        super().__init__(self.message)


class FileUploadException(ParrotManagementException):
    """文件上传异常"""
    def __init__(self, message: str = "文件上传失败"):
        self.message = message
        super().__init__(self.message)


def exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    if isinstance(exc, NotFoundException):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": exc.message}
        )
    elif isinstance(exc, BadRequestException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": exc.message}
        )
    elif isinstance(exc, FileUploadException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": exc.message}
        )
    else:
        # 对于未处理的异常，返回500错误
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "服务器内部错误"}
        )
