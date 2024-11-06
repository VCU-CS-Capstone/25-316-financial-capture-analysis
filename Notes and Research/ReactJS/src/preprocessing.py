from imutils.perspective import four_point_transform
import pytesseract
import argparse
import imutils
import cv2
import re
import numpy as np
from scipy.ndimage import interpolation as inter
import os

def rescale_image(img, output_dir):
    img = cv2.resize(img, None, fx=1.2, fy=1.2, interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(os.path.join(output_dir, "1_rescaled.jpg"), img)
    return img

def grayscale_image(img, output_dir):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cv2.imwrite(os.path.join(output_dir, "2_grayscale.jpg"), img)
    return img

def remove_noise(img, output_dir):
    kernel = np.ones((1, 1), np.uint8)
    img_dilated = cv2.dilate(img, kernel, iterations=1)
    img_eroded = cv2.erode(img_dilated, kernel, iterations=1)
    img_gaussian_blur = cv2.GaussianBlur(img_eroded, (5, 5), 0)
    img_threshold = cv2.threshold(img_gaussian_blur, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    img_bilateral = cv2.bilateralFilter(img_threshold, 5, 75, 75)
    img_adaptive_thresh = cv2.adaptiveThreshold(img_bilateral, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                                cv2.THRESH_BINARY, 31, 2)
    cv2.imwrite(os.path.join(output_dir, "3_noise_removed.jpg"), img_adaptive_thresh)
    return img_adaptive_thresh

def remove_shadows(img, output_dir):
    rgb_planes = cv2.split(img)
    result_planes = []
    for plane in rgb_planes:
        dilated_img = cv2.dilate(plane, np.ones((7, 7), np.uint8))
        bg_img = cv2.medianBlur(dilated_img, 21)
        diff_img = 255 - cv2.absdiff(plane, bg_img)
        result_planes.append(cv2.normalize(diff_img, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1))
    result = cv2.merge(result_planes)
    cv2.imwrite(os.path.join(output_dir, "4_shadows_removed.jpg"), result)
    return result

def deskew_image(image, output_dir, delta=0.5, limit=15):
    def determine_score(arr, angle):
        data = inter.rotate(arr, angle, reshape=False, order=0)
        histogram = np.sum(data, axis=1)
        score = np.sum((histogram[1:] - histogram[:-1]) ** 2)
        return histogram, score

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    scores = []
    angles = np.arange(-limit, limit + delta, delta)
    for angle in angles:
        _, score = determine_score(thresh, angle)
        scores.append(score)

    best_angle = angles[scores.index(max(scores))]
    print(f"Detected skew angle: {best_angle}")

    if abs(best_angle) > 0.1:
        (h, w) = image.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), best_angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    else:
        rotated = image

    cv2.imwrite(os.path.join(output_dir, "5_deskewed.jpg"), rotated)
    return rotated

def rotate_image(input_file, output_file, angle=90):
    img = cv2.imread(input_file)
    (h, w) = img.shape[:2]
    if w < h:
        angle = 0
    M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    cv2.imwrite(output_file, rotated)

def process_image_for_ocr(image_path, debug=-1):
    orig = cv2.imread(image_path)
    image = orig.copy()
    image = imutils.resize(image, width=500)
    ratio = orig.shape[1] / float(image.shape[1])
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 75, 200)

    if debug > 0:
        cv2.imwrite("debug_input_image.jpg", image)
        cv2.imwrite("debug_edged_image.jpg", edged)
        print("[INFO] Debug images saved: 'debug_input_image.jpg' and 'debug_edged_image.jpg'")

    cnts = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)

    receiptCnt = None
    for c in cnts:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:
            receiptCnt = approx
            break

    if receiptCnt is None:
        raise Exception(("Could not find receipt outline. Try debugging your edge detection and contour steps."))

    if debug > 0:
        output = image.copy()
        cv2.drawContours(output, [receiptCnt], -1, (0, 255, 0), 2)
        cv2.imwrite("debug_receipt_outline.jpg", output)
        print("[INFO] Debug image saved: 'debug_receipt_outline.jpg'")

    receipt = four_point_transform(orig, receiptCnt.reshape(4, 2) * ratio)
    cv2.imwrite("receipt_transformed.jpg", imutils.resize(receipt, width=500))
    print("[INFO] Transformed receipt image saved: 'receipt_transformed.jpg'")

    options = "--psm 4"
    text = pytesseract.image_to_string(
        cv2.cvtColor(receipt, cv2.COLOR_BGR2RGB),
        config=options
    )

    print("[INFO] raw output:")
    print("==================")
    print(text)
    print("\n")

    with open("receipt_text_output.txt", "w") as f:
        f.write(text)

    print("[INFO] OCR text saved to 'receipt_text_output.txt'")

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument("-i", "--image", required=True,
                    help="path to input receipt image")
    ap.add_argument("-d", "--debug", type=int, default=-1,
                    help="whether or not we are visualizing each step of the pipeline")
    args = vars(ap.parse_args())

    process_image_for_ocr(args["image"], args["debug"])
