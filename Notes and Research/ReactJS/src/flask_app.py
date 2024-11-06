from flask import Flask, request, jsonify
import os
import cv2
from data_pipeline import process_receipt  # Updated import after renaming main.py to data_pipeline.py
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

        # Process the receipt image
        output_dir = os.path.join(os.getcwd(), 'processed_images')
        os.makedirs(output_dir, exist_ok=True)

        process_receipt(file_path, output_dir)  # Ensure this function is correctly defined
        output_text_file = os.path.join(output_dir, file.filename.split('.')[0] + '.txt')

        if not os.path.exists(output_text_file):
            raise FileNotFoundError(f"Processed text file not found: {output_text_file}")

        with open(output_text_file, 'r', encoding='utf-8') as f:
            ocr_text = f.read()

        return jsonify({"ocr_text": ocr_text}), 200

    except FileNotFoundError as fnf_error:
        print(f"File not found error: {fnf_error}")
        return jsonify({"error": str(fnf_error)}), 500
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
