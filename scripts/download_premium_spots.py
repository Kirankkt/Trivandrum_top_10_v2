import requests
import json
import os
import time

API_KEY = "AIzaSyCxkCgpESLmnZ3XmgYJPNHS-Q9RmiKl7b0"
PROJECT_PATH = r"C:\Users\kthom\OneDrive\Documents\Trivandrum top 10"
IMAGES_DIR = os.path.join(PROJECT_PATH, "images", "places")
JSON_PATH = os.path.join(PROJECT_PATH, "data", "premium_spots.json")

os.makedirs(IMAGES_DIR, exist_ok=True)

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

count = 0
for locality in data:
    for spot in locality.get("spots", []):
        photo_url = spot.get("photo_url", "")
        if "maps.googleapis.com" not in photo_url:
            continue

        # Add API key if not present
        if "key=" not in photo_url:
            photo_url = photo_url + "&key=" + API_KEY

        # Extract photo reference for filename
        if "photoreference=" in photo_url:
            ref = photo_url.split("photoreference=")[1].split("&")[0][:16]
        else:
            continue

        filename = f"{ref}.jpg"
        filepath = os.path.join(IMAGES_DIR, filename)
        local_path = f"images/places/{filename}"

        # Skip if exists
        if os.path.exists(filepath):
            spot["photo_url"] = local_path
            count += 1
            print(f"[{count}] Already exists: {filename}")
            continue

        # Download
        try:
            print(f"[{count}] Downloading: {spot.get('name', 'Unknown')[:40]}...")
            response = requests.get(photo_url, timeout=30)
            if response.status_code == 200:
                with open(filepath, 'wb') as img:
                    img.write(response.content)
                spot["photo_url"] = local_path
                count += 1
                print(f"    Saved: {filename}")
            else:
                print(f"    FAILED: {response.status_code}")
        except Exception as e:
            print(f"    ERROR: {e}")

        time.sleep(0.3)

# Save updated JSON
with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nDone! Updated {count} images.")
