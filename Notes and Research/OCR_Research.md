# OCR Research

## AWS Textract

### [Detect Text Document OCR](https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html)

Textract's Detect Text Document API detects text in the input document; Can detect lines of text and the words that make up a line of text. The input document must be in one of the following image formats: JPEG, PNG, PDF, or TIFF. Returns the detected text in an array of block objects.

| per 1000 pages/month |       |
|:---------------------|:-----:|
| first million        | $1.50 |
| Over a million       | $0.60 |

### [Analyze Expense API](https://docs.aws.amazon.com/textract/latest/dg/invoices-receipts.html)

Extracts relevant data such as vendor and reciever contact information from almost any invoice or receipt without the need for any template or configuration.

Automatically extracts datya such as invoice or receipt date, invoice or receipt number, item prices, total amount, and payment terms.

Identifies vendor names that may not be explicitly labeled. ex. ability to find vendor name on a receipt even if it is only indicated withy a logo at the top of the page.

[Demo](https://docs.aws.amazon.com/textract/latest/dg/analyzing-document-expense.html)

| per 1000 pages/month |        |
|:---------------------|:------:|
| first million        | $10.00 |
| Over a million       | $8.00  |

## Google Cloud Vision API

### Document Text Detection

Can detect and extract text from images but is optimized for dense text and documents. The JSON includes page, block, paragraph, word, and break information.

| per 1000 pages/month |       |
|:---------------------|:-----:|
| first 5 million      | $1.50 |
| Over 5 million       | $1.00 |

### Document AI

Custom Classifier

| per 1000 pages/month |       |
|:---------------------|:-----:|
| first million        | $5.00 |
| Over a million       | $3.00 |

## Microsoft Azure

Allows you to extract rich information from images and videos in order to categorize and process visual data. Capabilities include image tagging, people detection, text extraction (OCR), and spatial analysis.

### [Image Analysis](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/computer-vision/)

##### Group 1

Includes:

Tag, Face, getThumbnail, Color, Image Type, GetAreaOfInterest, People Detection, Smart Crops, OCR, Adult, Celebrity, Landmark, Object Detection, Brand.

| per 1000 transactions/month |       |
|:----------------------------|:-----:|
| first million               | $1.00 |
| 1-10 million                | $0.65 |
| 10-100 million              | $0.60 |
| 100+ million                | $0.40 |

##### Group 2

Includes:

Describe, Read, Caption, Dense Captions.

| per 1000 transactions/month   |       |
|:------------------------------|:-----:|
| first million                 | $1.50 |
| Over a million                | $0.60 |

### [Document Intelligence](https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/)

##### Custom Classification 

Document Intelligence learns from your documents to intelligently classify them into different types. If a file consists of multiple documents of different types, it will also automatically identify document boundaries for further processing.

$3 per 1000 pages/month

## [Tesseract](https://github.com/tesseract-ocr/tesseract)

Open-Source

Tesseract has unicode (UTF-8) support, and can recognize more than 100 languages "out of the box". It supports various image formats including PNG, JPEG and TIFF Supports the following output formats: plain text, hOCR (HTML), PDF, invisible-text-only PDF, TSV, ALTO and PAGE.

## [EasyOCR](https://github.com/JaidedAI/EasyOCR)
Open-Source

A python module for extracting text from images. It is a general OCR that can read both natural scene text and dense text in a document.

Dedicated to making OCR implimentation easier for developers and made to be user-friendly for people with no background in OCR or computer vision

The free open source version includes 30 ocr operations; web interface integration; JPEG, PNG, and TIFF inputs; and json exports.

Resources:
[installation](https://www.jaided.ai/easyocr/install/)|
[tutorial](https://www.jaided.ai/easyocr/tutorial/) |
[Guide](https://medium.com/@adityamahajan.work/easyocr-a-comprehensive-guide-5ff1cb850168) |
[Demo](https://www.jaided.ai/easyocr/) |
[Pipeline](https://medium.com/@mohamed5elyousfi/-277e9c685578)

## [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)

Open-Source

OCR framework/toolkit that provides multiligual practical OCR tools that help users to apply and train different models in a few lines of code.

Offers a series of high quality pre-trained models which contain three types of models to make OCR highly accurate. It provides text detection. text direction classifieer, and text recognition.

Recources:
[introduction](https://medium.com/@danushidk507/paddleocr-439a8d92fb1a) |
[fine-tuning guide](https://anushsom.medium.com/finetuning-paddleocrs-recognition-model-for-dummies-by-a-dummy-89ac7d7edcf6)
