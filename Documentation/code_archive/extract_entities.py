import spacy
import re
import boto3
from botocore.exceptions import ClientError



# Load NER Model
nlp = spacy.load("trained_ner_model")

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

# Define the tables in DynamoDB
classification_table = dynamodb.Table('Classification')
item_table = dynamodb.Table('Item')
receipt_table = dynamodb.Table('Receipt')
receipts_table = dynamodb.Table('ReceiptsTable')
user_table = dynamodb.Table('User')
vendor_table = dynamodb.Table('Vendor')

# Function to clean total value (only numbers and decimals)
def clean_total(value):
    cleaned = re.sub(r'[^\d.]', '', value)
    print(f"Original TOTAL: '{value}' | Cleaned TOTAL: '{cleaned}'")
    return cleaned

# Function to validate phone numbers (10-11 digits)
def validate_phone(phone):
    cleaned_phone = re.sub(r'[^\d]', '', phone)
    if 10 <= len(cleaned_phone) <= 11:
        print(f"Validated PHONE: {cleaned_phone}")
        return cleaned_phone
    print(f"Ignored invalid PHONE: {phone}")
    return None

# Helper function to put item into DynamoDB table with error handling
def put_item_to_dynamodb(table, item):
    try:
        table.put_item(Item=item)
        print(f"Successfully added item: {item}")
    except ClientError as e:
        print(f"Failed to add item to table {table.name}: {e.response['Error']['Message']}")

# Process the input text for entity extraction
def process_text(text):
    # Process the text with the NER model
    doc = nlp(text)

    # Initialize lists to collect entities by label
    vendors = []
    items = []
    discounts = []
    totals = []
    phones = []

    # Collect and clean entities
    for ent in doc.ents:
        label = ent.label_.strip()  # Remove any leading or trailing whitespace
        if label == "VENDOR":
            vendors.append(ent.text)
        elif label == "ITEM":
            items.append(ent.text)
        elif label == "DISCOUNT":
            discounts.append(ent.text)
        elif label == "TOTAL":
            cleaned_total = clean_total(ent.text)
            if cleaned_total:
                totals.append(float(cleaned_total))  # Convert to float for consistent formatting
        elif label == "PHONE":
            validated_phone = validate_phone(ent.text)
            if validated_phone:
                phones.append(validated_phone)

    # Save entities to DynamoDB tables based on structure
    if vendors:
        vendor_item = {'VendorID': vendors[0]}
        put_item_to_dynamodb(vendor_table, vendor_item)

    for item_text in items:
        item = {'ItemID': item_text}
        put_item_to_dynamodb(item_table, item)


    for total in totals:
        receipt_item = {'ReceiptID': str(total)}
        put_item_to_dynamodb(receipt_table, receipt_item)

    for phone in phones:
        user_item = {'UserID': phone}  
        put_item_to_dynamodb(user_table, user_item)

    # Store a summary in ReceiptsTable
    receipts_summary = {
        'PK': 'ReceiptSummary',  # Partition key for receipt summaries
        'SK': 'SummaryDetails',
        'TotalItems': len(items),
        'TotalAmount': min(totals) if totals else None
    }
    put_item_to_dynamodb(receipts_table, receipts_summary)

    print("Data successfully saved to DynamoDB.")

