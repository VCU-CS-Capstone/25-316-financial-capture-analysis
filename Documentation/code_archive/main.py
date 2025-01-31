import os
import cv2
from image_preprocessing import rescale_image, rotate_image, deskew_image, remove_noise, remove_shadows, grayscale_image
from tesseract_engine import run_tesseract

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
        print(f"File not found: {filename}")
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
