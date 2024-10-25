import boto3

# Runs AWS Textract on the image file and returns extracted text.
def run_textract(input_file):
    textract = boto3.client("textract")
    try:
        with open(input_file, "rb") as document:
            response = textract.detect_document_text(Document={"Bytes": document.read()})
        
        textract_data = []
        for item in response["Blocks"]:
            if item["BlockType"] == "LINE":
                textract_data.append(item["Text"])
        
        return "\n".join(textract_data)
    except Exception as e:
        print(f"Error running Textract OCR: {e}")
        return ""
