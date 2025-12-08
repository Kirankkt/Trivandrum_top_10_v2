"""
Curated Locality Photo Fetcher
Uses hand-picked search queries for landmarks, temples, and notable places
to get better quality representative photos for each locality.
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

# Curated search queries - prioritizing landmarks, temples, parks, and notable buildings
# Each locality has multiple fallback options
LOCALITIES = {
    'Sreekaryam': [
        'College of Engineering Trivandrum CET',
        'Sreekaryam Devi Temple',
        'Loyola School Sreekaryam'
    ],
    'Statue': [
        'Kerala Secretariat Trivandrum',
        'Palayam St Josephs Cathedral Trivandrum',
        'Statue junction Trivandrum aerial view'
    ],
    'Kazhakuttom': [
        'Technopark Phase 3 Trivandrum',
        'Technopark Trivandrum aerial',
        'Infosys Technopark Trivandrum'
    ],
    'Enchakkal': [
        'Trivandrum Central Railway Station',
        'KSRTC Bus Stand Trivandrum',
        'East Fort Trivandrum'
    ],
    'Pattom': [
        'Kerala State Library Trivandrum',
        'Pattom Palace Trivandrum',
        'Pattom Green Gardens'
    ],
    'Kesavadasapuram': [
        'Attukal Bhagavathy Temple Trivandrum',
        'Kesavadasapuram Temple',
        'Trivandrum city aerial view'
    ],
    'PMG': [
        'Kerala Press Club Trivandrum',
        'PMG Junction Trivandrum',
        'Pazhavangadi Ganapathy Temple'
    ],
    'Sasthamangalam': [
        'Sasthamangalam Sree Mahadevar Temple',
        'Sasthamangalam Trivandrum gardens',
        'Sasthamangalam residential area'
    ],
    'Jagathy': [
        'Jagathy Sree Krishna Temple Trivandrum',
        'Jagathy junction Trivandrum',
        'Trivandrum city skyline'
    ],
    'Vellayambalam': [
        'Napier Museum Trivandrum',
        'Kerala Museum Trivandrum',
        'Kanakakkunnu Palace Trivandrum'
    ],
    'Kowdiar': [
        'Kowdiar Palace Trivandrum',
        'Kanakakunnu Palace Trivandrum',
        'Sri Padmanabhaswamy Temple Trivandrum'
    ],
    'Peroorkada': [
        'Peroorkada Government Hospital',
        'Peroorkada Junction Trivandrum',
        'Ponmudi Hill Station Kerala'
    ],
    'Ulloor': [
        'Akkulam Lake Trivandrum',
        'Akkulam Tourist Village',
        'Technopark main gate Trivandrum'
    ],
    'Vazhuthacaud': [
        'Vazhuthacaud Ganapathy Temple Trivandrum',
        'LMS Compound Trivandrum',
        'Vazhuthacaud junction'
    ],
    'Medical College': [
        'Government Medical College Hospital Trivandrum',
        'SAT Hospital Trivandrum',
        'Regional Cancer Centre Trivandrum'
    ],
    'Kuravankonam': [
        'Kuravankonam Temple Trivandrum',
        'Kowdiar junction Trivandrum',
        'Trivandrum Palace grounds'
    ],
    'Ambalamukku': [
        'Ambalamukku Subramanya Temple Trivandrum',
        'Ambalamukku junction aerial view',
        'Peroorkada Temple Trivandrum'
    ],
    'Poojapura': [
        'Poojappura Stadium Trivandrum',
        'Poojappura Central Prison entrance',
        'Poojapura Temple Trivandrum'
    ],
    'Kovalam': [
        'Kovalam Lighthouse Beach Kerala',
        'Kovalam Beach sunset Kerala',
        'Leela Kovalam Beach Resort'
    ],
    'Varkala': [
        'Varkala Cliff sunset Kerala',
        'Papanasam Beach Varkala',
        'Janardhana Swamy Temple Varkala'
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
    print("\n" + "="*70)
    print("📸 CURATED LOCALITY PHOTO FETCHER")
    print("="*70)
    
    if not GOOGLE_MAPS_API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env")
        return
    
    locality_photos = {}
    failed = []
    
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
            print(f"   ❌ No photo found for {locality_name}")
            failed.append(locality_name)
            locality_photos[locality_name] = None
    
    # Save results
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    output_file = os.path.join(output_dir, 'locality_photos.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(locality_photos, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*70)
    print(f"✅ SAVED: {output_file}")
    print("="*70)
    
    # Summary
    success = sum(1 for v in locality_photos.values() if v)
    print(f"\n📊 Summary: {success}/{len(LOCALITIES)} localities have photos")
    
    if failed:
        print(f"⚠️  Failed: {', '.join(failed)}")
    
    print("\n📷 Photo sources:")
    for name, data in locality_photos.items():
        if data:
            print(f"   {name:20} → {data['place_name']}")


if __name__ == '__main__':
    main()
