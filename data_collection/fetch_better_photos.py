"""
Better Locality Photo Fetcher
Uses Google Places API to get more appealing photos by searching for:
- Landmarks
- Famous temples
- Tourist attractions
- Parks and scenic locations
- Popular restaurants/cafes
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

# All 20 localities with better search queries for more appealing photos
LOCALITIES = [
    {'name': 'Sreekaryam', 'searches': ['Sreekaryam Temple Trivandrum', 'Sreekaryam junction Trivandrum']},
    {'name': 'Statue', 'searches': ['Statue junction Trivandrum', 'Secretariat Trivandrum Kerala']},
    {'name': 'Kazhakuttom', 'searches': ['Technopark Trivandrum', 'Kazhakuttam Trivandrum']},
    {'name': 'Enchakkal', 'searches': ['Enchakkal Trivandrum', 'Eanchakkal junction']},
    {'name': 'Pattom', 'searches': ['Pattom junction Trivandrum', 'Kerala State Library Trivandrum']},
    {'name': 'Kesavadasapuram', 'searches': ['Kesavadasapuram Trivandrum', 'Kowdiar Palace Trivandrum']},
    {'name': 'PMG', 'searches': ['PMG junction Trivandrum', 'Press Road Trivandrum']},
    {'name': 'Sasthamangalam', 'searches': ['Sasthamangalam Temple Trivandrum', 'Sasthamangalam junction']},
    {'name': 'Jagathy', 'searches': ['Jagathy junction Trivandrum', 'Jagathy Trivandrum']},
    {'name': 'Vellayambalam', 'searches': ['Vellayambalam Trivandrum', 'Museum Trivandrum Kerala']},
    {'name': 'Kowdiar', 'searches': ['Kowdiar Palace Trivandrum', 'Kanakakunnu Palace Trivandrum']},
    {'name': 'Peroorkada', 'searches': ['Peroorkada Trivandrum', 'Peeroorkada junction']},
    {'name': 'Ulloor', 'searches': ['Ulloor Trivandrum', 'Akkulam Lake Trivandrum']},
    {'name': 'Vazhuthacaud', 'searches': ['Vazhuthacaud Trivandrum', 'LMS junction Trivandrum']},
    {'name': 'Medical College', 'searches': ['Medical College Trivandrum', 'SAT Hospital Trivandrum']},
    {'name': 'Kuravankonam', 'searches': ['Kuravankonam Trivandrum', 'Kowdiar Trivandrum']},
    {'name': 'Ambalamukku', 'searches': ['Ambalamukku junction Trivandrum', 'Ambalamukku Temple']},
    {'name': 'Poojapura', 'searches': ['Poojapura Trivandrum', 'Poojappura Central Jail Trivandrum']},
    {'name': 'Kovalam', 'searches': ['Kovalam Beach Kerala', 'Kovalam Lighthouse', 'Leela Kovalam']},
    {'name': 'Varkala', 'searches': ['Varkala Cliff Beach', 'Varkala Beach Kerala', 'Papanasam Beach Varkala']}
]


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
    print("📸 BETTER LOCALITY PHOTO FETCHER")
    print("="*60)
    
    if not GOOGLE_MAPS_API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env")
        return
    
    locality_photos = {}
    
    for locality in LOCALITIES:
        print(f"\n📍 {locality['name']}...")
        
        # Try each search query until we find a good photo
        found = False
        for search_query in locality['searches']:
            print(f"   Trying: {search_query}...")
            result = search_place_photos(search_query)
            
            if result:
                photo_url = get_photo_url(result['photo_reference'], 1200)
                locality_photos[locality['name']] = {
                    'photo_reference': result['photo_reference'],
                    'photo_url': photo_url,
                    'place_id': result['place_id'],
                    'place_name': result['place_name'],
                    'search_query': search_query
                }
                print(f"   ✅ Found: {result['place_name']}")
                found = True
                break
        
        if not found:
            print(f"   ❌ No photo found")
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
    
    print("\n📷 Photo sources:")
    for name, data in locality_photos.items():
        if data:
            print(f"   {name}: {data['place_name']}")


if __name__ == '__main__':
    main()
