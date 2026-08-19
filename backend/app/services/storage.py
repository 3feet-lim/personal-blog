from abc import ABC, abstractmethod
from io import BytesIO

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import get_settings


class StorageAdapter(ABC):
    @abstractmethod
    def ensure_bucket(self) -> None:
        raise NotImplementedError

    @abstractmethod
    def upload_bytes(self, object_key: str, content: bytes, content_type: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def download_bytes(self, object_key: str) -> bytes:
        raise NotImplementedError


class S3StorageAdapter(StorageAdapter):
    """S3-compatible storage adapter.

    Local development targets MinIO via ``S3_ENDPOINT_URL``. Production targets
    real AWS S3 by leaving ``S3_ENDPOINT_URL`` empty, in which case credentials
    are resolved through boto3's default credential chain (e.g. an ECS Task
    Role) instead of static keys.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.bucket = settings.s3_bucket
        self.endpoint_url = settings.s3_endpoint_url or None

        client_kwargs: dict = {
            "region_name": settings.s3_region,
        }
        if self.endpoint_url:
            client_kwargs["endpoint_url"] = self.endpoint_url
            client_kwargs["config"] = Config(signature_version="s3v4")
            # Local MinIO uses static credentials; production S3 relies on the
            # default credential chain (e.g. ECS Task Role) when these are unset.
            if settings.aws_access_key_id and settings.aws_secret_access_key:
                client_kwargs["aws_access_key_id"] = settings.aws_access_key_id
                client_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key

        self.client = boto3.client("s3", **client_kwargs)

    def ensure_bucket(self) -> None:
        # Only local MinIO buckets are bootstrapped automatically. Production
        # S3 buckets are expected to be provisioned out-of-band.
        if not self.endpoint_url:
            return

        try:
            self.client.head_bucket(Bucket=self.bucket)
        except ClientError as error:
            error_code = error.response.get("Error", {}).get("Code", "")
            if error_code in {"404", "NoSuchBucket", "NotFound"}:
                self.client.create_bucket(Bucket=self.bucket)
            else:
                raise

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
    return S3StorageAdapter()
