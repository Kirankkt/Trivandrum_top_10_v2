"""
Fetch distinct data for Restaurants, Cafes, and Hotels using Google Places API.
Calculates a 'Foodie Score' based on:
1. Sentiment (Rating)
2. Popularity (Reviews)
3. Visuals (Photos)
4. Value (Price/Rating)
5. Vibe (Keyword analysis)
6. Convenience (Open hours, delivery)
"""

import os
import sys
import json
import time
import math
import requests
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Distinct Categories and Search Queries
CATEGORIES = {
    'restaurants': {
        'filename': 'restaurants.json',
        'queries': ['best restaurants in Trivandrum', 'fine dining Trivandrum', 'authentic kerala food Trivandrum', 'seafood restaurants Trivandrum'],
        'exclude_types': ['lodging']
    },
    'cafes': {
        'filename': 'cafes.json',
        'queries': ['best cafes in Trivandrum', 'coffee shops Trivandrum', 'work friendly cafe Trivandrum'],
        'exclude_types': ['lodging']
    },
    'hotels': {
        'filename': 'hotels.json',
        'queries': ['luxury hotels Trivandrum', '5 star hotels Trivandrum', 'best resorts Trivandrum'],
        'exclude_types': []
    }
}

def search_places(query):
    """Search for places using Text Search"""
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        'query': query,
        'key': GOOGLE_MAPS_API_KEY,
        'region': 'in'
    }
    try:
        response = requests.get(url, params=params)
        return response.json().get('results', [])
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

def get_place_details(place_id):
    """Fetch detailed info mainly for reviews and amenities"""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    fields = "place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,photo,reviews,types,website,opening_hours,formatted_phone_number,delivery,dine_in,reservable,wheelchair_accessible_entrance"
    params = {
        'place_id': place_id,
        'fields': fields,
        'key': GOOGLE_MAPS_API_KEY
    }
    try:
        response = requests.get(url, params=params)
        return response.json().get('result', {})
    except Exception as e:
        print(f"Error getting details for {place_id}: {e}")
        return {}

def get_photo_url(photo_reference):
    if not photo_reference:
        return None
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"

def analyze_vibe_and_amenities(details):
    """Analyze reviews and boolean fields for Vibe and Convenience"""
    reviews = details.get('reviews', [])
    text_content = " ".join([r.get('text', '') for r in reviews]).lower()
    
    # Vibe Keywords
    vibe_keywords = {
        'Romantic': ['romantic', 'couple', 'candle', 'date', 'view'],
        'Work Friendly': ['wifi', 'laptop', 'work', 'quiet', 'socket'],
        'Family': ['family', 'kids', 'group', 'parking', 'spacious'],
        'Trendy': ['aesthetic', 'instagram', 'decor', 'beautiful', 'vibe'],
        'Authentic': ['authentic', 'traditional', 'nadan', 'spicy', 'local']
    }
    
    vibes = []
    for vibe, keywords in vibe_keywords.items():
        if any(k in text_content for k in keywords):
            vibes.append(vibe)
            
    # Convenience Score (0-10)
    convenience_score = 0
    if details.get('opening_hours', {}).get('open_now'): convenience_score += 2
    if details.get('delivery'): convenience_score += 2
    if details.get('dine_in'): convenience_score += 2
    if details.get('reservable'): convenience_score += 2
    if details.get('wheelchair_accessible_entrance'): convenience_score += 2
    
    return vibes, convenience_score

def calculate_foodie_score(details, convenience_score):
    """Calculate the comprehensive Trivandrum Score (0-100)"""
    rating = details.get('rating', 0)
    reviews = details.get('user_ratings_total', 0)
    photo_count = len(details.get('photos', []))
    price_level = details.get('price_level', 2) # Default to medium if unknown
    
    if reviews < 10: return 0 # Too new to rank
    
    # 1. Sentiment (0-35 points)
    # Base is rating. 4.0->20, 4.5->27.5, 5.0->35
    sentiment_score = 35 * ((rating - 3.5) / 1.5) if rating > 3.5 else 0
    sentiment_score = max(0, min(35, sentiment_score))
    
    # 2. Popularity (0-25 points)
    # Log scale. 1000 reviews is roughly max score
    popularity_score = 0
    if reviews > 0:
        popularity_score = 25 * (math.log(reviews) / math.log(2000))
    popularity_score = max(0, min(25, popularity_score))
    
    # 3. Visuals (0-10 points)
    visual_score = min(10, photo_count / 2) # 20 photos = max score
    
    # 4. Value (0-10 points)
    # High rating + Low price = High Value
    # Price 1: x1.2, Price 4: x0.8
    value_multiplier = {0: 1.0, 1: 1.2, 2: 1.0, 3: 0.9, 4: 0.8}.get(price_level, 1.0)
    value_score = min(10, (rating * 2) * value_multiplier - 6) # Rough heuristic
    value_score = max(0, value_score)
    
    # 5. Vibe (Keyword Richness) (0-10 points)
    # More vibe tags = better defined experience
    # Calculated in analyze function, but roughly:
    # We will use sentiment of reviews in future, for now simplified to popularity of keywords
    # Let's just give base points for high rating
    vibe_score = min(10, rating * 2)
    
    # 6. Convenience (0-10 points)
    # Passed in
    
    total_score = sentiment_score + popularity_score + visual_score + value_score + vibe_score + convenience_score
    return round(total_score, 1)

def main():
    print("\n" + "="*60)
    print("🍽️ FETCHING DINING & STAY DATA")
    print("="*60)
    
    if not GOOGLE_MAPS_API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env")
        return

    # Master loop for each category
    for cat_key, config in CATEGORIES.items():
        print(f"\n📂 Processing Category: {cat_key.upper()}")
        all_candidates = {}
        
        # 1. Search
        for query in config['queries']:
            print(f"   🔍 Searching: '{query}'...")
            results = search_places(query)
            for place in results:
                pid = place['place_id']
                # Filter out excluded types (e.g., don't show hotels in restaurant list if possible)
                types = place.get('types', [])
                if any(t in config['exclude_types'] for t in types):
                    continue
                # Basic Quality Filter
                if place.get('user_ratings_total', 0) >= 50 and place.get('rating', 0) >= 3.8:
                    all_candidates[pid] = place
            time.sleep(1) # Be nice to API
            
        print(f"   ✨ Found {len(all_candidates)} unique candidates. Fetching details for Top 15...")
        
        # Sort by raw rating*reviews to pick top candidates to detail fetch
        sorted_candidates = sorted(all_candidates.values(), 
                                   key=lambda x: x.get('rating', 0) * math.log(x.get('user_ratings_total', 0) or 1), 
                                   reverse=True)[:15]
        
        final_data = []
        
        # 2. Detail Fetch & Scoring
        for candidate in sorted_candidates:
            pid = candidate['place_id']
            print(f"      Fetching details for: {candidate.get('name')}")
            details = get_place_details(pid)
            
            if not details: continue
            
            vibes, conv_score = analyze_vibe_and_amenities(details)
            final_score = calculate_foodie_score(details, conv_score)
            
            # Formatted Item
            item = {
                'id': pid,
                'name': details.get('name'),
                'score': final_score,
                'rating': details.get('rating'),
                'reviews': details.get('user_ratings_total'),
                'price_level': details.get('price_level', 2),
                'address': details.get('formatted_address'),
                'image': get_photo_url(details.get('photos', [{}])[0].get('photo_reference')),
                'category': cat_key,
                'vibes': vibes,
                'website': details.get('website'),
                'phone': details.get('formatted_phone_number'),
                'map_url': details.get('url'), # Google Maps Link
                'metrics': {
                    'sentiment': round(35 * ((details.get('rating',0) - 3.5)/1.5), 1),
                    'popularity': details.get('user_ratings_total'),
                    'convenience': conv_score
                }
            }
            final_data.append(item)
            time.sleep(0.5)
            
        # Sort by Final Foodie Score
        final_data.sort(key=lambda x: x['score'], reverse=True)
        
        # Save
        filepath = os.path.join(os.path.dirname(__file__), '..', 'data', config['filename'])
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, indent=2, ensure_ascii=False)
        print(f"   ✅ Saved {len(final_data)} top {cat_key} to {config['filename']}")

    print("\n" + "="*60)
    print("🎉 ALL DATA COLLECTED")

if __name__ == '__main__':
    main()
