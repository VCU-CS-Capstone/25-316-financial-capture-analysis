import re
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

# Define the tables in DynamoDB
receipts_table = dynamodb.Table('ReceiptsTable')

# Function to clean total value (only numbers and decimals)
def clean_total(value):
    if value is None:
        return None
    cleaned = re.sub(r'[^\d.]', '', str(value))
    print(f"Original TOTAL: '{value}' | Cleaned TOTAL: '{cleaned}'")
    return Decimal(cleaned) if cleaned else None

# Helper function to put item into DynamoDB table with error handling
def put_item_to_dynamodb(table, item):
    try:
        print(f"Attempting to add item: {item}")
        table.put_item(Item=item)
        print(f"Successfully added item: {item}")
    except ClientError as e:
        print(f"Failed to add item to table {table.name}: {e.response['Error']['Message']}")

# Process structured receipt data
def process_receipt_data(data):
    # Extract and clean data
    total_spent = clean_total(data.get("TotalSpent"))
    vendor_name = data.get("VendorName")
    vendor_address = data.get("VendorAddress")
    transaction_date = data.get("TransactionDate")

    # Prepare item for ReceiptsTable
    receipt_item = {
        'PK': f"vendor#{vendor_name}" if vendor_name else "unknown",
        'SK': f"receipt#{transaction_date}" if transaction_date else "unknown",
        'VendorName': vendor_name,
        'VendorAddress': vendor_address,
        'Date': transaction_date,
        'TotalSpent': total_spent
    }

    # Remove None values from the item
    receipt_item = {k: v for k, v in receipt_item.items() if v is not None}

    # Debugging: Print the prepared item before saving
    print(f"Prepared item for DynamoDB: {receipt_item}")

    # Save to DynamoDB
    put_item_to_dynamodb(receipts_table, receipt_item)

    print("Data successfully saved to DynamoDB.")


