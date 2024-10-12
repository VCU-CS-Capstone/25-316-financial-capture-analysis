import io
import os
import cv2
import numpy as np
from PIL import Image
from pytesseract import pytesseract
from wand.image import Image as WandImage
from scipy.ndimage import interpolation as inter

ORANGE = '\033[33m'
RESET = '\033[0m'

def save_image(img, step_name, output_dir):
    """
    Saves the image with a specific step name for inspection.
    """
    step_path = os.path.join(output_dir, f"{step_name}.jpg")
    cv2.imwrite(step_path, img)
    print(ORANGE + f"~: Saved image after {step_name} at: {step_path}" + RESET)

def rescale_image(img, output_dir):
    """
    Rescales the image by a factor of 1.2.
    """
    print(ORANGE + '\t~: ' + RESET + 'Rescale image' + RESET)
    img = cv2.resize(img, None, fx=1.2, fy=1.2, interpolation=cv2.INTER_CUBIC)
    save_image(img, "rescaled", output_dir)
    return img

def grayscale_image(img, output_dir):
    """
    Converts the image to grayscale.
    """
    print(ORANGE + '\t~: ' + RESET + 'Grayscale image' + RESET)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    save_image(img, "grayscale", output_dir)
    return img

def remove_noise(img, output_dir):
    """
    Applies noise removal with a combination of blurs and thresholds, saving the image after each step.
    """
    print(ORANGE + '\t~: ' + RESET + 'Removing noise' + RESET)
    
    # Dilation
    kernel = np.ones((1, 1), np.uint8)
    img_dilated = cv2.dilate(img, kernel, iterations=1)
    save_image(img_dilated, "noise_removal_dilation", output_dir)

    # Erosion
    img_eroded = cv2.erode(img_dilated, kernel, iterations=1)
    save_image(img_eroded, "noise_removal_erosion", output_dir)

    # Gaussian Blur
    img_gaussian_blur = cv2.GaussianBlur(img_eroded, (5, 5), 0)
    save_image(img_gaussian_blur, "noise_removal_gaussian_blur", output_dir)

    # Thresholding
    img_threshold = cv2.threshold(img_gaussian_blur, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    save_image(img_threshold, "noise_removal_threshold", output_dir)

    # Bilateral Filter
    img_bilateral = cv2.bilateralFilter(img_threshold, 5, 75, 75)
    save_image(img_bilateral, "noise_removal_bilateral", output_dir)

    # Adaptive Threshold
    img_adaptive_thresh = cv2.adaptiveThreshold(img_bilateral, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                                cv2.THRESH_BINARY, 31, 2)
    save_image(img_adaptive_thresh, "noise_removal_adaptive_threshold", output_dir)

    return img_adaptive_thresh

def remove_shadows(img, output_dir):
    """
    Removes shadows from the image by normalizing the background.
    """
    print(ORANGE + '\t~: ' + RESET + 'Removing shadows' + RESET)
    rgb_planes = cv2.split(img)
    result_planes = []
    for plane in rgb_planes:
        dilated_img = cv2.dilate(plane, np.ones((7, 7), np.uint8))
        bg_img = cv2.medianBlur(dilated_img, 21)
        diff_img = 255 - cv2.absdiff(plane, bg_img)
        result_planes.append(cv2.normalize(diff_img, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1))
    result = cv2.merge(result_planes)
    save_image(result, "removed_shadows", output_dir)
    return result

def deskew_image(image, output_dir, delta=1, limit=5):
    """
    Deskews the image by finding the best angle of rotation.
    """
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

    print(ORANGE + '\t~: ' + RESET + 'Deskew image by: ' + str(best_angle) + '°' + RESET)
    save_image(rotated, "deskewed", output_dir)
    return rotated

def rotate_image(input_file, output_file, angle=90):
    """
    Rotates the image and saves the result.
    """
    print(ORANGE + '\t~: ' + RESET + 'Rotate image by: ' + str(angle) + '°' + RESET)
    with WandImage(filename=input_file) as img:
        width, height = img.size
        if width < height:
            angle = 0
        with img.clone() as rotated:
            rotated.rotate(angle)
            rotated.save(filename=output_file)

def run_tesseract(input_file, output_file, language="eng"):
    """
    Runs Tesseract OCR on the image and saves the result as a text file.
    """
    print(ORANGE + '\t~: ' + RESET + 'Running Tesseract OCR' + RESET)
    with Image.open(input_file) as img:
        image_data = pytesseract.image_to_string(img, lang=language, timeout=60, config="--psm 6")
        with open(output_file, "w", encoding='utf-8') as out:
            out.write(image_data)

def enhance_image(img, tmp_path, output_dir, rotate=True):
    """
    Enhances the image by applying rescaling, rotation, deskewing, noise removal, and shadow removal.
    Saves the image after each step for inspection.
    """
    img = rescale_image(img, output_dir)

    if rotate:
        cv2.imwrite(tmp_path, img)
        rotate_image(tmp_path, tmp_path)
        img = cv2.imread(tmp_path)
        save_image(img, "rotated", output_dir)

    img = deskew_image(img, output_dir)
    img = remove_shadows(img, output_dir)
    img = grayscale_image(img, output_dir)
    img = remove_noise(img, output_dir)

    return img

def process_receipt(filename, output_dir, rotate=True):
    """
    Processes a single receipt image and saves each processing step.
    """
    print(ORANGE + '~: ' + RESET + 'Processing image: ' + ORANGE + filename + RESET)

    try:
        img = cv2.imread(filename)
    except FileNotFoundError:
        print(ORANGE + '~: ' + RESET + 'File not found' + RESET)
        return

    tmp_path = os.path.join(output_dir, "tmp_processed.jpg")
    img = enhance_image(img, tmp_path, output_dir, rotate)

    print(ORANGE + '~: ' + RESET + 'Temporary store image at: ' + ORANGE + tmp_path + RESET)
    cv2.imwrite(tmp_path, img)

    output_path = os.path.join(output_dir, filename.split(".")[0] + ".txt")
    run_tesseract(tmp_path, output_path)

    print(ORANGE + '~: ' + RESET + 'Store parsed text at: ' + ORANGE + output_path + RESET)

def main():
    """
    Main function to process the image based on user input and save each iteration.
    """
    image_path = input("Enter the image file name or path: ")
    if not os.path.isabs(image_path):
        image_path = os.path.join(os.getcwd(), image_path)

    output_dir = os.path.join(os.getcwd(), "processed_images")
    os.makedirs(output_dir, exist_ok=True)

    process_receipt(image_path, output_dir)

if __name__ == '__main__':
    main()
