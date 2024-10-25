import cv2
import numpy as np
from scipy.ndimage import interpolation as inter
import os

# Ensure the output directory exists
output_dir = os.path.expanduser("~/saved_images")
os.makedirs(output_dir, exist_ok=True)

# Rescales the image by a factor of 1.2.
def rescale_image(img, output_dir):
    img = cv2.resize(img, None, fx=1.2, fy=1.2, interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(os.path.join(output_dir, "1_rescaled.jpg"), img)
    return img

# Converts the image to grayscale.
def grayscale_image(img, output_dir):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cv2.imwrite(os.path.join(output_dir, "2_grayscale.jpg"), img)
    return img

# Applies noise removal with a combination of blurs and thresholds.
def remove_noise(img, output_dir):
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
    cv2.imwrite(os.path.join(output_dir, "3_noise_removed.jpg"), img_adaptive_thresh)

    return img_adaptive_thresh

# Removes shadows from the image by normalizing the background.
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

# Deskews the image by finding the best angle of rotation.
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
    print(f"Detected skew angle: {best_angle}")  # Debugging line

    # Only rotate if angle is significantly different from 0
    if abs(best_angle) > 0.1:
        (h, w) = image.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), best_angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    else:
        rotated = image  # No rotation if angle is close to 0

    cv2.imwrite(os.path.join(output_dir, "5_deskewed.jpg"), rotated)
    return rotated


# Rotates the image using OpenCV and saves the result.
def rotate_image(input_file, output_file, angle=90):
    img = cv2.imread(input_file)
    (h, w) = img.shape[:2]
    if w < h:
        angle = 0  # If the width is less than the height, no rotation is needed.
    
    # Rotate the image
    M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Save the rotated image
    cv2.imwrite(output_file, rotated)
