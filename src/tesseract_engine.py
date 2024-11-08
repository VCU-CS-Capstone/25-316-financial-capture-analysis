from PIL import Image
import pytesseract
import extract_entities  # Import the entity extraction module

# Function to run Tesseract OCR on an image and process extracted text
def run_tesseract(input_file, language="eng"):
    try:
        # Print the input file for confirmation
        print(f"Processing file: {input_file}")

        # Open the image file and extract text with Tesseract
        with Image.open(input_file) as img:
            # Run OCR with specified language and settings
            extracted_text = pytesseract.image_to_string(img, lang=language, config="--psm 6")
            print("OCR Result:", extracted_text)  # Output OCR result for reference

            # Pass the extracted text to the entity extraction module for further processing
            extract_entities.process_text(extracted_text)
    except pytesseract.TesseractError as e:
        print(f"Tesseract Error: {e}")
    except Exception as e:
        print(f"Error running Tesseract OCR: {e}")

# Example usage:
# run_tesseract("example_image.png")
