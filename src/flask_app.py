from flask import Flask, request, jsonify
import os
from data_pipeline import process_receipt_with_textract
from flask_cors import CORS
import boto3
from decimal import Decimal
from s3_storage import upload_receipt_to_s3
from datetime import datetime, timezone

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

        upload_date = datetime.now(timezone.utc).strftime("%m-%d-%Y")  # MM-DD-YYYY format
        
        receipt_item = {
            'PK': f"vendor#{data.get('VendorName', 'unknown')}",
            'SK': f"receipt#{data.get('TransactionDate', 'unknown')}",
            'VendorName': data.get('VendorName'),
            'VendorAddress': data.get('VendorAddress'),
            'Date': data.get('TransactionDate'),
            'TotalAmount': Decimal(total_amount) if total_amount else None,
            'ExpenseType': expense_type,  # Add ExpenseType to the item
            'ImageURL': data.get('ImageURL'), # Store image URL in the db
            'UploadDate': upload_date
        }

        # Remove None values from the item
        receipt_item = {k: v for k, v in receipt_item.items() if v is not None}
        print("Prepared item for DynamoDB:", receipt_item)

        # Save to DynamoDB
        receipts_table.put_item(Item=receipt_item)
        print("Successfully added item to DynamoDB:", receipt_item)

        return jsonify({"message": "Receipt saved successfully", "Upload date": upload_date}), 200

    except Exception as e:
        print(f"Error occurred while saving to DynamoDB: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/update-receipt', methods=['PUT'])
def update_receipt():
    try:
        data = request.json
        print("Received update request:", data)

        pk = data.get('PK')  # Ensure this is in the format "vendor#Xfinity"
        sk = data.get('SK')  # Ensure this is in the format "receipt#10/23/2024"

        if not pk or not sk:
            return jsonify({'error': 'Missing PK or SK'}), 400

        update_expression = "SET TotalAmount = :ta, ExpenseType = :et, TransactionDate = :td, VendorName = :vn, VendorAddress = :va"
        
        expression_attribute_values = {
            ":ta": Decimal(str(data["TotalAmount"])),
            ":et": data["ExpenseType"],
            ":td": data["TransactionDate"],
            ":vn": data["VendorName"],
            ":va": data["VendorAddress"]
        }

        response = receipts_table.update_item(
            Key={'PK': pk, 'SK': sk},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="UPDATED_NEW"
        )

        print("Successfully updated receipt in DynamoDB:", response)
        return jsonify({"message": "Receipt updated successfully", "updated_fields": response.get("Attributes", {})}), 200

    except Exception as e:
        print(f"Error updating receipt: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/get-receipts', methods=['GET'])
def get_receipts():
    try:
        response = receipts_table.scan()
        items = response.get('Items', [])

        updated_items = []
        for item in items:
            new_item = item.copy()

            if "TransactionDate" not in new_item and "Date" in new_item:
                new_item["TransactionDate"] = new_item.pop("Date")  # Map "Date" to "TransactionDate"

            updated_items.append(new_item)

        print("Receipts fetched with TransactionDate:", updated_items)  # Debugging output

        return jsonify(updated_items), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete-receipt', methods=['DELETE'])
def delete_receipt():
    try:
        data = request.get_json()
        pk = data.get('PK')
        sk = data.get('SK')

        if not pk or not sk:
            return jsonify({'error': 'Missing PK or SK'}), 400
        
        response = receipts_table.delete_item(
            Key={
                'PK': pk,
                'SK': sk
            }
        )
        
        return jsonify({'message': 'Receipt deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
