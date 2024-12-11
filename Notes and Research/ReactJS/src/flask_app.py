from flask import Flask, request, jsonify
import os
from data_pipeline import process_receipt_with_textract
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Endpoint for uploading an image and processing it
@app.route('/upload-receipt', methods=['POST'])
def upload_receipt():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save the uploaded file to a temporary directory
        upload_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        file.save(file_path)

        # Process the receipt image using Textract
        receipt_data = process_receipt_with_textract(file_path)

        if not receipt_data:
            return jsonify({"error": "Failed to process receipt"}), 500

        # Return the extracted data as JSON
        return jsonify(receipt_data), 200

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
