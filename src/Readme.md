# Source Code Folder
This is where the files for our project are stored.

Please document here
| Subdirectory Name | Description |
|---|---|
| | |
| | |
| | |
| | |
| | |


# Receipt Parser
## Overview

**`receipt_parser.py`** is a Python script designed to process and extract text from receipt images using a combination of image preprocessing techniques and Optical Character Recognition (OCR) via Tesseract. The script enhances the quality of receipt images by applying various transformations such as rescaling, rotation, deskewing, noise removal, and shadow removal before extracting the text.

## Features

- **Image Rescaling**: Enlarges the image to improve OCR accuracy.
- **Grayscale Conversion**: Converts the image to grayscale for better preprocessing.
- **Noise Removal**: Applies blurs, thresholding, and filters to remove image noise.
- **Shadow Removal**: Reduces shadows to enhance the visibility of text.
- **Deskewing**: Corrects the alignment of the image by finding the optimal rotation angle.
- **Rotation**: Automatically rotates the image to the correct orientation if necessary.
- **OCR with Tesseract**: Uses Tesseract OCR to extract text from the processed receipt image.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/VCU-CS-Capstone/25-316-financial-capture-analysis.git
   cd 25-316-financial-capture-analysis/src
  ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
  ```

You may also need to  install Tesseract OCR on your system.  Instructions for installation can be found here: [Tesseract Github](https://github.com/tesseract-ocr/tesseract)

3. Install ImageMagick:
   - **For Windows**: Download and install from [ImageMagick Download](https://imagemagick.org/script/download.php).
   - **For macOS**: Install using Homebrew:
     ```bash
     brew install imagemagick
     ```
   - **For Linux**: Install using the package manager:
     ```bash
     sudo apt-get install imagemagick
     ```

4. Make sure you have OpenCV, PIL (Pillow), NumPy, Wand, and other required libraries installed:
```bash
pip install opencv-python numpy pillow pytesseract Wand
```
