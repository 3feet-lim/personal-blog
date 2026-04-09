from abc import ABC, abstractmethod
from io import BytesIO

import boto3
from botocore.client import Config

from app.core.config import get_settings


class StorageAdapter(ABC):
    @abstractmethod
    def ensure_bucket(self) -> None:
        raise NotImplementedError

    @abstractmethod
    def get_public_url(self, object_key: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def upload_bytes(self, object_key: str, content: bytes, content_type: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def download_bytes(self, object_key: str) -> bytes:
        raise NotImplementedError


class MinioStorageAdapter(StorageAdapter):
    def __init__(self) -> None:
        settings = get_settings()
        self.bucket = settings.storage_bucket
        self.endpoint = settings.storage_endpoint
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.storage_endpoint,
            aws_access_key_id=settings.storage_access_key,
            aws_secret_access_key=settings.storage_secret_key,
            use_ssl=settings.storage_secure,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1",
        )

    def ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except Exception:
            self.client.create_bucket(Bucket=self.bucket)

    def get_public_url(self, object_key: str) -> str:
        return f"{self.endpoint}/{self.bucket}/{object_key}"

    def upload_bytes(self, object_key: str, content: bytes, content_type: str) -> str:
        stream = BytesIO(content)
        self.client.upload_fileobj(
            stream,
            self.bucket,
            object_key,
            ExtraArgs={"ContentType": content_type},
        )
        return object_key

    def download_bytes(self, object_key: str) -> bytes:
        response = self.client.get_object(Bucket=self.bucket, Key=object_key)
        return response["Body"].read()


def get_storage_adapter() -> StorageAdapter:
    return MinioStorageAdapter()
