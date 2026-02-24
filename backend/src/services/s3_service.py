import os
import uuid
from typing import Optional
from fastapi import UploadFile

from src.settings import settings

try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    boto3 = None
    ClientError = Exception


class S3Service:
    def __init__(self):
        self.bucket_name = settings.s3_bucket_name
        self.region = settings.aws_region
        # We only initialize the client if we have credentials and boto3 is installed
        if boto3 and settings.aws_access_key_id and settings.aws_secret_access_key:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=self.region
            )
        else:
            self.s3_client = None

    async def upload_public_file(self, file: UploadFile, folder: str = "profiles") -> Optional[str]:
        """
        Uploads a file to S3 and returns the public URL.
        """
        if not self.s3_client:
            open("s3_error.log", "w").write("S3 Client not initialized. Missing credentials or boto3."); print("S3 Client not initialized. Missing credentials or boto3.")
            return None

        try:
            # Generate a unique filename
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
            unique_filename = f"{folder}/{uuid.uuid4()}{file_extension}"

            # Read file content
            file_content = await file.read()

            # Upload to S3 with correct content type
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=unique_filename,
                Body=file_content,
                ContentType=file.content_type,
            )

            # Generate public URL
            public_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{unique_filename}"
            return public_url

        except ClientError as e:
            print(f"Error uploading file to S3: {e}"); open("s3_error.log", "w").write(str(e))
            return None
        except Exception as e:
            print(f"Unexpected error uploading file: {e}"); open("s3_error.log", "w").write(str(e))
            return None

# Singleton instance
s3_service = S3Service()
