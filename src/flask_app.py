from flask import Flask, request, jsonify
import os
from data_pipeline import process_receipt_with_textract
from flask_cors import CORS
import boto3
from decimal import Decimal
from s3_storage import upload_receipt_to_s3

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
receipts_table = dynamodb.Table('ReceiptsTable')

# Endpoint for uploading an image and processing it
@app.route('/upload-receipt', methods=['POST'])
def upload_receipt():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        print(f"Received file: {file.filename}")
        

        # Save the uploaded file to a temporary directory
        upload_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        file.save(file_path)
        
        print(f"File saved to: {file_path}")
        
        # Upload receipt image to S3 (Current version - No User ID)
        image_url = upload_receipt_to_s3(file_path)

        # Future Implementation (With User ID)
        # user_id = request.form.get('user_id', 'unknown_user')  # Get user ID from request
        # image_url = upload_receipt_to_s3(file_path, user_id)  # Pass user ID

        # Process the receipt image using Textract
        receipt_data = process_receipt_with_textract(file_path)

        if not receipt_data:
            return jsonify({"error": "Failed to process receipt"}), 500
        
        
        # If the data contains the typo key, fix it:
        if 'mageURL' in receipt_data:
            # Remap it to the correct key and remove the old one.
            receipt_data['ImageURL'] = receipt_data.pop('mageURL')
        else:
            # Otherwise, use the S3 URL returned from the upload function.
            receipt_data['ImageURL'] = image_url

        print(f"Extracted receipt data: {receipt_data}")
        return jsonify(receipt_data), 200

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

# Endpoint for confirming and saving receipt data
@app.route('/confirm-receipt', methods=['POST'])
def confirm_receipt():
    try:
        data = request.json
        print("Received data:", data)

        # Clean up and validate data
        total_amount = data.get('TotalAmount', '0').replace('$', '').strip()
        expense_type = data.get('ExpenseType', 'Other')  # Default to 'Other' if not provided

        receipt_item = {
            'PK': f"vendor#{data.get('VendorName', 'unknown')}",
            'SK': f"receipt#{data.get('TransactionDate', 'unknown')}",
            'VendorName': data.get('VendorName'),
            'VendorAddress': data.get('VendorAddress'),
            'Date': data.get('TransactionDate'),
            'TotalAmount': Decimal(total_amount) if total_amount else None,
            'ExpenseType': expense_type,  # Add ExpenseType to the item
            'ImageURL': data.get('ImageURL') # Store image URL in the db
        }

        # Remove None values from the item
        receipt_item = {k: v for k, v in receipt_item.items() if v is not None}
        print("Prepared item for DynamoDB:", receipt_item)

        # Save to DynamoDB
        receipts_table.put_item(Item=receipt_item)
        print("Successfully added item to DynamoDB:", receipt_item)

        return jsonify({"message": "Receipt saved successfully"}), 200

    except Exception as e:
        print(f"Error occurred while saving to DynamoDB: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
