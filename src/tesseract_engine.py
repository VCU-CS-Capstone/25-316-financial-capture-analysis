from PIL import Image
from pytesseract import pytesseract

# Runs Tesseract OCR on the image and saves the result as a text file.
def run_tesseract(input_file, output_file, language="eng"):
    try:
        with Image.open(input_file) as img:
            image_data = pytesseract.image_to_string(img, lang=language, timeout=60, config="--psm 6")
            with open(output_file, "w", encoding='utf-8') as out:
                out.write(image_data)
    except Exception as e:
        print(f"Error running Tesseract OCR: {e}")
