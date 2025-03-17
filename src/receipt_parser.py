import io
import os
import cv2
import numpy as np
from PIL import Image
from pytesseract import pytesseract
from wand.image import Image as WandImage
from scipy.ndimage import interpolation as inter

# Rescales the image by a factor of 1.2.
def rescale_image(img):
    img = cv2.resize(img, None, fx=1.2, fy=1.2, interpolation=cv2.INTER_CUBIC)
    return img

# Converts the image to grayscale.
def grayscale_image(img):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img

# Applies noise removal with a combination of blurs and thresholds.
def remove_noise(img):
    # Dilation
    kernel = np.ones((1, 1), np.uint8)
    img_dilated = cv2.dilate(img, kernel, iterations=1)

    # Erosion
    img_eroded = cv2.erode(img_dilated, kernel, iterations=1)

    # Gaussian Blur
    img_gaussian_blur = cv2.GaussianBlur(img_eroded, (5, 5), 0)

    # Thresholding
    img_threshold = cv2.threshold(img_gaussian_blur, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    # Bilateral Filter
    img_bilateral = cv2.bilateralFilter(img_threshold, 5, 75, 75)

    # Adaptive Threshold
    img_adaptive_thresh = cv2.adaptiveThreshold(img_bilateral, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                                cv2.THRESH_BINARY, 31, 2)

    return img_adaptive_thresh

# Removes shadows from the image by normalizing the background.
def remove_shadows(img):
    rgb_planes = cv2.split(img)
    result_planes = []
    for plane in rgb_planes:
        dilated_img = cv2.dilate(plane, np.ones((7, 7), np.uint8))
        bg_img = cv2.medianBlur(dilated_img, 21)
        diff_img = 255 - cv2.absdiff(plane, bg_img)
        result_planes.append(cv2.normalize(diff_img, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1))
    result = cv2.merge(result_planes)
    return result

# Deskews the image by finding the best angle of rotation.
def deskew_image(image, delta=1, limit=5):
    def determine_score(arr, angle):
        data = inter.rotate(arr, angle, reshape=False, order=0)
        histogram = np.sum(data, axis=1)
        score = np.sum((histogram[1:] - histogram[:-1]) ** 2)
        return histogram, score

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    scores = []
    angles = np.arange(-limit, limit + delta, delta)
    for angle in angles:
        _, score = determine_score(thresh, angle)
        scores.append(score)

    best_angle = angles[scores.index(max(scores))]
    (h, w) = image.shape[:2]
    M = cv2.getRotationMatrix2D((w // 2, h // 2), best_angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    return rotated

# Rotates the image and saves the result.
def rotate_image(input_file, output_file, angle=90):
    with WandImage(filename=input_file) as img:
        width, height = img.size
        if width < height:
            angle = 0
        with img.clone() as rotated:
            rotated.rotate(angle)
            rotated.save(filename=output_file)

# Runs Tesseract OCR on the image and saves the result as a text file.
def run_tesseract(input_file, output_file, language="eng"):
    with Image.open(input_file) as img:
        image_data = pytesseract.image_to_string(img, lang=language, timeout=60, config="--psm 6")
        with open(output_file, "w", encoding='utf-8') as out:
            out.write(image_data)

# Enhances the image by applying rescaling, rotation, deskewing, noise removal, and shadow removal.
def enhance_image(img, tmp_path, rotate=True):
    img = rescale_image(img)

    if rotate:
        cv2.imwrite(tmp_path, img)
        rotate_image(tmp_path, tmp_path)
        img = cv2.imread(tmp_path)

    img = deskew_image(img)
    img = remove_shadows(img)
    img = grayscale_image(img)
    img = remove_noise(img)

    return img

# Processes a single receipt image.
def process_receipt(filename, output_dir, rotate=True):
    try:
        img = cv2.imread(filename)
    except FileNotFoundError:
        return

    tmp_path = os.path.join(output_dir, "tmp_processed.jpg")
    img = enhance_image(img, tmp_path, rotate)

    cv2.imwrite(tmp_path, img)

    output_path = os.path.join(output_dir, filename.split(".")[0] + ".txt")
    run_tesseract(tmp_path, output_path)

# Main function to process the image based on user input.
def main():
    image_path = input("Enter the image file name or path: ")
    if not os.path.isabs(image_path):
        image_path = os.path.join(os.getcwd(), image_path)

    output_dir = os.path.join(os.getcwd(), "processed_images")
    os.makedirs(output_dir, exist_ok=True)

    process_receipt(image_path, output_dir)

if __name__ == '__main__':
    main()
