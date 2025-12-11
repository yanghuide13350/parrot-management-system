import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import BadRequestException, FileUploadException


class FileUploadUtil:
    """文件上传工具类"""

    @staticmethod
    def _is_allowed_file(filename: str) -> tuple[bool, Optional[str]]:
        """
        检查文件类型是否允许

        Args:
            filename: 文件名

        Returns:
            (是否允许, 错误信息)
        """
        ext = filename.split(".")[-1].lower()

        if ext not in settings.ALLOWED_EXTENSIONS:
            return False, f"不支持的文件类型. 支持的类型: {', '.join(settings.ALLOWED_EXTENSIONS)}"

        return True, None

    @staticmethod
    def _generate_unique_filename(original_filename: str) -> tuple[str, str]:
        """
        生成唯一的文件名

        Args:
            original_filename: 原始文件名

        Returns:
            (唯一文件名, 文件扩展名)
        """
        ext = original_filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        return unique_filename, ext

    @staticmethod
    async def upload_photo(
        file: UploadFile,
        subfolder: str = "parrots",
        max_size: Optional[int] = None,
        check_content_type: bool = False,
    ) -> tuple[str, str]:
        """
        上传照片

        Args:
            file: FastAPI UploadFile对象
            subfolder: 子文件夹名称
            max_size: 最大文件大小限制 (字节)
            check_content_type: 是否检查content-type

        Returns:
            (目标相对路径, 原始文件名)

        Raises:
            BadRequestException: 文件验证失败
            FileUploadException: 文件上传失败
        """
        # 设置默认大小
        max_size = max_size or settings.MAX_FILE_SIZE

        # 文件名验证
        if not file.filename:
            raise BadRequestException("文件名不能为空")

        # 文件类型验证
        is_allowed, error = FileUploadUtil._is_allowed_file(file.filename)

        if not is_allowed:
            raise BadRequestException(error)

        # 文件大小检查
        file.file.seek(0, 2)
        file_size = file.file.tell()

        if file_size > max_size:
            raise BadRequestException(f"文件大小超过限制: {max_size / (1024 * 1024):.1f}MB")

        # 重置文件指针
        file.file.seek(0)

        # 生成唯一文件名
        target_filename, _ = FileUploadUtil._generate_unique_filename(file.filename)

        # 检查并创建上传目录
        subfolder_path = Path(settings.UPLOAD_DIR) / subfolder

        try:
            subfolder_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise FileUploadException(f"无法创建上传目录: {e}")

        # 文件保存路径
        target_path = subfolder_path / target_filename

        # 保存文件
        try:
            content = await file.read()

            target_path.write_bytes(content)
            print(f"文件上传成功: {target_path}")

        except Exception as e:
            raise FileUploadException(f"文件保存失败: {e}")
        finally:
            await file.close()

        # 返回相对路径
        relative_path = str(target_path.relative_to(settings.UPLOAD_DIR))

        return relative_path, file.filename

    @staticmethod
    def delete_file(file_path: str) -> bool:
        """
        删除文件

        Args:
            file_path: 文件的相对路径

        Returns:
            是否删除成功
        """
        try:
            full_path = Path(settings.UPLOAD_DIR) / file_path

            if full_path.exists() and full_path.is_file():
                full_path.unlink()
                print(f"文件已删除: {full_path}")
                return True

            return False
        except (OSError, ValueError) as e:
            print(f"文件删除失败 {file_path}: {e}")
            return False