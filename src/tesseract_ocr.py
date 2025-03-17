import pytesseract
from image_preprocessing import preprocess_image

def extract_text_from_receipt(input_image_path, output_image_path):
    processed_image_path = preprocess_image(input_image_path, 'processed_receipt.jpg')

    extracted_text = pytesseract.image_to_string(processed_image_path)

    with open(output_image_path, 'w') as text_file:
        text_file.write(extracted_text)

if __name__ == "__main__":
    extract_text_from_receipt('C:/Users/VCU/Desktop/SCHOOL/fall 24/capstone/tesseract demo/wf_receipt.jpg', 'text_wf_receipt.txt')