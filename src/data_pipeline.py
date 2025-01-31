import boto3
import os
import json
import re
from extract_entities import process_receipt_data

# AWS Textract client setup
textract = boto3.client('textract')

# Function to process receipt using AnalyzeExpense API
def process_receipt_with_textract(file_path):
    try:
        # Load the image as bytes
        with open(file_path, 'rb') as document:
            image_bytes = document.read()

        # Call Textract's AnalyzeExpense API
        response = textract.analyze_expense(Document={'Bytes': image_bytes})

        # Extract key details from the response
        receipt_data = extract_expense_details(response)

        return receipt_data

    except Exception as e:
        print(f"Error processing receipt: {e}")
        return None

# Function to extract specific fields from AnalyzeExpense API response
def extract_expense_details(response):
    details = {
        'TotalSpent': None,
        'VendorName': None,
        'VendorAddress': None,
        'TransactionDate': None
    }

    # Regex pattern to match common date formats
    date_pattern = r'\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\b'
    
    # Iterate through expense documents
    for document in response.get('ExpenseDocuments', []):
        for summary_field in document.get('SummaryFields', []):
            field_type = summary_field.get('Type', {}).get('Text', '')
            field_value = summary_field.get('ValueDetection', {}).get('Text', '')

            if field_type == 'TOTAL':
                details['TotalAmount'] = field_value
            elif field_type == 'VENDOR_NAME':
                details['VendorName'] = field_value
            elif field_type == 'VENDOR_ADDRESS':
                details['VendorAddress'] = field_value
            elif field_type in ['TRANSACTION_DATE', 'DATE', 'INVOICE_RECEIPT_DATE']:
                if field_value and re.match(date_pattern, field_value):
                    details['TransactionDate'] = field_value

    # If no TransactionDate is found, search the entire text for a potential date
    if not details['TransactionDate']:
        raw_text = " ".join([
            field.get('ValueDetection', {}).get('Text', '')
            for document in response.get('ExpenseDocuments', [])
            for field in document.get('SummaryFields', [])
        ])
        dates = re.findall(date_pattern, raw_text)
        if dates:
            details['TransactionDate'] = dates[0]  # Take the first matched date

    if details['VendorName'] and details['VendorAddress']:
        details['VendorAddress'] = details['VendorAddress'].replace(details['VendorName'], '').strip()

    return details

# Main function to handle user input and process receipts
def main():
    image_path = input("Enter the image file name or path: ")
    if not os.path.isabs(image_path):
        image_path = os.path.join(os.getcwd(), image_path)

    if not os.path.exists(image_path):
        print("File does not exist.")
        return

    print("Processing receipt...")
    receipt_data = process_receipt_with_textract(image_path)

    if receipt_data:
        print("Receipt Details:")
        print(json.dumps(receipt_data, indent=4))

        # Pass the extracted details to the DynamoDB processing function
        print("Saving receipt data to DynamoDB...")
        process_receipt_data(receipt_data)

    else:
        print("Failed to extract receipt details.")

if __name__ == '__main__':
    main()
