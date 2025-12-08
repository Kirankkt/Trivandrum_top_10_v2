"""
Locality Photo Fetcher
Uses Google Places API to get real photos for all 20 localities.
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# All 20 localities with their coordinates
LOCALITIES = [
    {'name': 'Sreekaryam', 'lat': 8.5444, 'lng': 76.9066},
    {'name': 'Statue', 'lat': 8.5099, 'lng': 76.9509},
    {'name': 'Kazhakuttom', 'lat': 8.5599, 'lng': 76.8792},
    {'name': 'Enchakkal', 'lat': 8.5450, 'lng': 76.9150},
    {'name': 'Pattom', 'lat': 8.5282, 'lng': 76.9410},
    {'name': 'Kesavadasapuram', 'lat': 8.5230, 'lng': 76.9320},
    {'name': 'PMG', 'lat': 8.5059, 'lng': 76.9590},
    {'name': 'Sasthamangalam', 'lat': 8.5120, 'lng': 76.9700},
    {'name': 'Jagathy', 'lat': 8.5069, 'lng': 76.9500},
    {'name': 'Vellayambalam', 'lat': 8.5020, 'lng': 76.9570},
    {'name': 'Kowdiar', 'lat': 8.5100, 'lng': 76.9630},
    {'name': 'Peroorkada', 'lat': 8.5350, 'lng': 76.9700},
    {'name': 'Ulloor', 'lat': 8.5390, 'lng': 76.9150},
    {'name': 'Vazhuthacaud', 'lat': 8.5000, 'lng': 76.9610},
    {'name': 'Medical College', 'lat': 8.5261, 'lng': 76.9512},
    {'name': 'Kuravankonam', 'lat': 8.5200, 'lng': 76.9500},
    {'name': 'Ambalamukku', 'lat': 8.5330, 'lng': 76.9570},
    {'name': 'Poojapura', 'lat': 8.4920, 'lng': 76.9720},
    {'name': 'Kovalam', 'lat': 8.4004, 'lng': 76.9787},
    {'name': 'Varkala', 'lat': 8.7379, 'lng': 76.7163}
]


def search_locality_place(locality_name, lat, lng):
    """Search for the locality as a place to get its place_id"""
    url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    params = {
        'query': f'{locality_name} Trivandrum Kerala',
        'location': f'{lat},{lng}',
        'radius': 2000,
        'key': GOOGLE_MAPS_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] == 'OK' and len(data['results']) > 0:
        return data['results'][0]
    return None


def get_place_photos(place_id):
    """Get photo references for a place"""
    url = 'https://maps.googleapis.com/maps/api/place/details/json'
    params = {
        'place_id': place_id,
        'fields': 'photos',
        'key': GOOGLE_MAPS_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] == 'OK' and 'result' in data and 'photos' in data['result']:
        return data['result']['photos']
    return []


def get_photo_url(photo_reference, max_width=800):
    """Generate photo URL from photo reference"""
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth={max_width}&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"


def main():
    print("\n" + "="*60)
    print("🏙️ LOCALITY PHOTO FETCHER")
    print("="*60)
    
    if not GOOGLE_MAPS_API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env")
        return
    
    locality_photos = {}
    
    for locality in LOCALITIES:
        print(f"\n📍 {locality['name']}...")
        
        # Search for the locality
        place = search_locality_place(locality['name'], locality['lat'], locality['lng'])
        
        if place:
            place_id = place['place_id']
            
            # Check if place itself has photos
            if 'photos' in place and len(place['photos']) > 0:
                photo_ref = place['photos'][0]['photo_reference']
                photo_url = get_photo_url(photo_ref, 800)
                locality_photos[locality['name']] = {
                    'photo_reference': photo_ref,
                    'photo_url': photo_url,
                    'place_id': place_id,
                    'place_name': place.get('name', locality['name'])
                }
                print(f"   ✅ Found photo from: {place.get('name', 'unknown')}")
            else:
                # Try to get photos from place details
                photos = get_place_photos(place_id)
                if photos:
                    photo_ref = photos[0]['photo_reference']
                    photo_url = get_photo_url(photo_ref, 800)
                    locality_photos[locality['name']] = {
                        'photo_reference': photo_ref,
                        'photo_url': photo_url,
                        'place_id': place_id,
                        'place_name': place.get('name', locality['name'])
                    }
                    print(f"   ✅ Found photo from details: {place.get('name', 'unknown')}")
                else:
                    # Search for a landmark
                    landmark_place = search_locality_place(f'{locality["name"]} landmark tourist attraction', locality['lat'], locality['lng'])
                    if landmark_place and 'photos' in landmark_place:
                        photo_ref = landmark_place['photos'][0]['photo_reference']
                        photo_url = get_photo_url(photo_ref, 800)
                        locality_photos[locality['name']] = {
                            'photo_reference': photo_ref,
                            'photo_url': photo_url,
                            'place_id': landmark_place['place_id'],
                            'place_name': landmark_place.get('name', locality['name'])
                        }
                        print(f"   ✅ Found landmark photo: {landmark_place.get('name', 'unknown')}")
                    else:
                        print(f"   ❌ No photo found")
                        locality_photos[locality['name']] = None
        else:
            print(f"   ❌ Place not found")
            locality_photos[locality['name']] = None
    
    # Save results
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'locality_photos.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(locality_photos, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print(f"✅ SAVED TO: {output_file}")
    print("="*60)
    
    # Summary
    found = sum(1 for v in locality_photos.values() if v)
    print(f"\n📊 Summary: {found}/{len(LOCALITIES)} localities have photos")


if __name__ == '__main__':
    main()
