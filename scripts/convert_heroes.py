"""
Batch convert hero images to WebP format with proper sizing for web.
Run: python scripts/convert_heroes.py
"""

from PIL import Image
import os

# Source and destination
SOURCE_DIR = "images/wesbite photos"
DEST_DIR = "images/heroes"

# Target width for hero images (height will scale proportionally)
TARGET_WIDTH = 1920
WEBP_QUALITY = 85

def convert_image(src_path, dest_path):
    """Convert and resize image to WebP"""
    try:
        with Image.open(src_path) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            # Resize if larger than target
            if img.width > TARGET_WIDTH:
                ratio = TARGET_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((TARGET_WIDTH, new_height), Image.LANCZOS)

            # Save as WebP
            img.save(dest_path, 'WEBP', quality=WEBP_QUALITY, optimize=True)

            # Get file sizes for comparison
            src_size = os.path.getsize(src_path) / (1024 * 1024)  # MB
            dest_size = os.path.getsize(dest_path) / (1024 * 1024)  # MB

            print(f"[OK] {os.path.basename(src_path)}")
            print(f"     {src_size:.1f}MB -> {dest_size:.2f}MB ({(1 - dest_size/src_size)*100:.0f}% reduction)")

    except Exception as e:
        print(f"[ERROR] Converting {src_path}: {e}")

def main():
    # Create destination directory
    os.makedirs(DEST_DIR, exist_ok=True)

    # File name mapping (source name → destination name)
    name_mapping = {
        'ayurveda.png': 'ayurveda.webp',
        'backwaters.png': 'backwaters.webp',
        'beaches.png': 'beaches.webp',
        'Cafe.png': 'cafes.webp',
        'clothing store.png': 'clothing-stores.webp',
        'culture sites.png': 'cultural-centers.webp',
        'Culture.png': 'culture.webp',
        'healthcare & Wellness.png': 'wellness.webp',
        'hospital.png': 'healthcare.webp',
        'Hotel.png': 'hotels.webp',
        'Landmarks.jpg': 'landmarks.webp',
        'Mall.png': 'malls.webp',
        'religious sites.png': 'religious-sites.webp',
        'Restaraunt.png': 'restaurants.webp',
        'SHopping.png': 'shopping.webp',
        'sports club.png': 'sports-clubs.webp',
        'Stay & DIne.png': 'stay-dine.webp',
        'Super Markets.png': 'supermarkets.webp',
        'theatres.png': 'theatres.webp',
        'training academics.png': 'training-academies.webp',
        'wildlife.png': 'nature-sanctuaries.webp',
    }

    print(f"Converting images from '{SOURCE_DIR}' to '{DEST_DIR}'...")
    print(f"Target width: {TARGET_WIDTH}px, WebP quality: {WEBP_QUALITY}\n")

    converted = 0
    for src_name, dest_name in name_mapping.items():
        src_path = os.path.join(SOURCE_DIR, src_name)
        dest_path = os.path.join(DEST_DIR, dest_name)

        if os.path.exists(src_path):
            convert_image(src_path, dest_path)
            converted += 1
        else:
            print(f"[SKIP] Source not found: {src_name}")

    print(f"\nDone! Converted {converted} images to WebP in '{DEST_DIR}'")

if __name__ == "__main__":
    main()
