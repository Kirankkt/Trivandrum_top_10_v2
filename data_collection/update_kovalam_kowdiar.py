"""
Fetch better photos specifically for Kovalam and Kowdiar
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

# Better search queries for Kovalam and Kowdiar
LOCALITIES = {
    'Kovalam': [
        'Kovalam Beach aerial view Kerala',
        'Kovalam Lighthouse sunset',
        'Hawa Beach Kovalam',
        'Samudra Beach Kovalam'
    ],
    'Kowdiar': [
        'Sri Padmanabhaswamy Temple aerial view',
        'Kowdiar Palace gate Trivandrum',
        'Kanakakunnu Palace garden Trivandrum',
        'Trivandrum Palace area'
    ]
}


def search_place_photos(query):
    """Search for a place and get its photos"""
    url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    params = {
        'query': query,
        'key': GOOGLE_MAPS_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] == 'OK' and len(data['results']) > 0:
        for result in data['results']:
            if 'photos' in result and len(result['photos']) > 0:
                photo = result['photos'][0]
                return {
                    'photo_reference': photo['photo_reference'],
                    'place_name': result.get('name', query),
                    'place_id': result['place_id']
                }
    return None


def get_photo_url(photo_reference, max_width=1200):
    """Generate photo URL from photo reference"""
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth={max_width}&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"


def main():
    print("\n" + "="*60)
    print("📸 UPDATING KOVALAM & KOWDIAR PHOTOS")
    print("="*60)
    
    if not GOOGLE_MAPS_API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env")
        return
    
    # Load existing photos
    photos_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'locality_photos.json')
    with open(photos_file, 'r', encoding='utf-8') as f:
        locality_photos = json.load(f)
    
    for locality_name, search_queries in LOCALITIES.items():
        print(f"\n📍 {locality_name}...")
        
        found = False
        for query in search_queries:
            print(f"   🔍 Trying: {query}...")
            result = search_place_photos(query)
            
            if result:
                photo_url = get_photo_url(result['photo_reference'], 1200)
                locality_photos[locality_name] = {
                    'photo_reference': result['photo_reference'],
                    'photo_url': photo_url,
                    'place_id': result['place_id'],
                    'place_name': result['place_name'],
                    'search_query': query
                }
                print(f"   ✅ Found: {result['place_name']}")
                found = True
                break
        
        if not found:
            print(f"   ❌ No better photo found for {locality_name}")
    
    # Save updated photos
    with open(photos_file, 'w', encoding='utf-8') as f:
        json.dump(locality_photos, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print("✅ UPDATED locality_photos.json")
    print("="*60)
    
    print("\n📷 New photo sources:")
    for name in LOCALITIES.keys():
        data = locality_photos.get(name)
        if data:
            print(f"   {name}: {data['place_name']}")


if __name__ == '__main__':
    main()
