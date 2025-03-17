import boto3
import uuid
import os

# AWS Configuration
AWS_REGION = "us-east-1"
S3_BUCKET_NAME = "receiptimagesfindex"

# Initialize Boto3 Clients
s3_client = boto3.client("s3", region_name=AWS_REGION)

# uploads a receipt image to S3 and returns its public URL
# Future task is to make sure the URL is NOT public, and only accessible to the user
# When multiple user accounts have been implemented, uncomment relevant lines of code below and add 'user_id' to the def inputs
def upload_receipt_to_s3(file_path):
    # Current implementation (No User ID)
    file_name = f"receipts/{uuid.uuid4()}_{os.path.basename(file_path)}"
    
    # Determine content type based on file extension
    content_type = "image/jpeg" if file_path.lower().endswith((".jpg", ".jpeg")) else "image/png"
    
    # Future implementation (With User ID)
    # file_name = f"receipts/{user_id}/{uuid.uuid4()}_{os.path.basename(file_path)}"
    
    # Upload file to S3
    s3_client.upload_file(file_path, S3_BUCKET_NAME, file_name, ExtraArgs={'ContentType': content_type})

    # Generate a public URL
    image_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{file_name}"
    
    return image_url


