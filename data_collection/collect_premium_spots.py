"""
Premium Spots Data Collection
Uses Google Places API to get accurate, verified places for each locality.
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

# Localities to collect data for
LOCALITIES = [
    {'name': 'Kowdiar', 'lat': 8.5100, 'lng': 76.9630},
    {'name': 'Pattom', 'lat': 8.5282, 'lng': 76.9410},
    {'name': 'Kazhakuttom', 'lat': 8.5599, 'lng': 76.8792},
    {'name': 'Kovalam', 'lat': 8.4004, 'lng': 76.9787},
    {'name': 'Varkala', 'lat': 8.7379, 'lng': 76.7163}
]

# Category to Google Places type mapping
CATEGORIES = {
    'heritage': {
        'icon': '🏛️',
        'types': ['hindu_temple', 'church', 'mosque', 'museum', 'tourist_attraction'],
        'keywords': ['temple', 'palace', 'museum', 'heritage', 'historical']
    },
    'dining': {
        'icon': '🍽️',
        'types': ['restaurant', 'cafe'],
        'keywords': ['restaurant', 'cafe', 'bakery']
    },
    'shopping': {
        'icon': '🛍️',
        'types': ['shopping_mall', 'supermarket', 'department_store'],
        'keywords': ['mall', 'shopping', 'market']
    },
    'recreation': {
        'icon': '🌳',
        'types': ['park', 'gym', 'stadium', 'amusement_park'],
        'keywords': ['park', 'beach', 'sports', 'club']
    },
    'essential': {
        'icon': '🏥',
        'types': ['hospital', 'bank', 'post_office'],
        'keywords': ['hospital', 'bank', 'medical']
    }
}

def search_places(lat, lng, place_type, radius=2000):
    """Search for places using Google Places API"""
    url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    params = {
        'location': f'{lat},{lng}',
        'radius': radius,
        'type': place_type,
        'key': GOOGLE_MAPS_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] == 'OK':
        return data['results']
    return []

def text_search_places(query, lat, lng, radius=2000):
    """Text-based search for specific places"""
    url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    params = {
        'query': query,
        'location': f'{lat},{lng}',
        'radius': radius,
        'key': GOOGLE_MAPS_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] == 'OK':
        return data['results']
    return []

def get_place_details(place_id):
    """Get detailed info including photo references"""
    url = 'https://maps.googleapis.com/maps/api/place/details/json'
    params = {
        'place_id': place_id,
        'fields': 'name,formatted_address,rating,photos,url,website,opening_hours',
        'key': GOOGLE_MAPS_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] == 'OK':
        return data['result']
    return {}

def get_photo_url(photo_reference, max_width=400):
    """Generate photo URL from photo reference"""
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth={max_width}&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"

def collect_spots_for_locality(locality):
    """Collect premium spots for a single locality"""
    print(f"\n{'='*50}")
    print(f"📍 Collecting spots for: {locality['name']}")
    print(f"{'='*50}")
    
    lat, lng = locality['lat'], locality['lng']
    spots = []
    
    for category_name, category_info in CATEGORIES.items():
        print(f"\n  📂 Category: {category_name}")
        category_spots = []
        
        # Search by place type
        for place_type in category_info['types'][:2]:  # Limit to avoid too many API calls
            results = search_places(lat, lng, place_type, radius=2000)
            
            for place in results[:3]:  # Top 3 per type
                # Skip if too far (outside 3km)
                place_lat = place['geometry']['location']['lat']
                place_lng = place['geometry']['location']['lng']
                
                # Get additional details
                details = get_place_details(place['place_id'])
                
                spot = {
                    'name': place['name'],
                    'category': category_name,
                    'icon': category_info['icon'],
                    'rating': place.get('rating', 0),
                    'address': place.get('vicinity', ''),
                    'place_id': place['place_id'],
                    'google_maps_url': details.get('url', f"https://www.google.com/maps/place/?q=place_id:{place['place_id']}"),
                    'lat': place_lat,
                    'lng': place_lng
                }
                
                # Get photo if available
                if 'photos' in place and len(place['photos']) > 0:
                    spot['photo_reference'] = place['photos'][0]['photo_reference']
                    spot['photo_url'] = get_photo_url(place['photos'][0]['photo_reference'])
                
                category_spots.append(spot)
                print(f"    ✓ {place['name']} ({place.get('rating', 'N/A')}⭐)")
        
        # Remove duplicates and keep top 2-3 per category
        seen_names = set()
        unique_spots = []
        for spot in sorted(category_spots, key=lambda x: x.get('rating', 0), reverse=True):
            if spot['name'] not in seen_names:
                seen_names.add(spot['name'])
                unique_spots.append(spot)
                if len(unique_spots) >= 2:  # Keep top 2 per category
                    break
        
        spots.extend(unique_spots)
    
    return {
        'locality': locality['name'],
        'spots': spots
    }

def main():
    print("\n" + "="*60)
    print("🏆 PREMIUM SPOTS COLLECTION")
    print("="*60)
    
    if not GOOGLE_MAPS_API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env")
        return
    
    all_data = []
    
    for locality in LOCALITIES:
        try:
            data = collect_spots_for_locality(locality)
            all_data.append(data)
            print(f"\n  ✅ Total spots for {locality['name']}: {len(data['spots'])}")
        except Exception as e:
            print(f"\n  ❌ Error collecting {locality['name']}: {e}")
            all_data.append({'locality': locality['name'], 'spots': [], 'error': str(e)})
    
    # Save results
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'premium_spots.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print(f"✅ SAVED TO: {output_file}")
    print("="*60)
    
    # Print summary
    for data in all_data:
        print(f"\n📍 {data['locality']}: {len(data['spots'])} spots")
        for spot in data['spots']:
            print(f"   {spot['icon']} {spot['name']} - {spot['category']}")

if __name__ == '__main__':
    main()
