"""
Deduplicated Locality Data Collection
Each amenity is counted for ONLY the nearest locality - no double counting.
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

# Localities to process
LOCALITIES = [
    {"name": "Sreekaryam", "lat": 8.5467708, "lng": 76.9163841},
    {"name": "Statue", "lat": 8.4931, "lng": 76.9489},
    {"name": "Kazhakuttom", "lat": 8.5639, "lng": 76.8733},
    {"name": "Enchakkal", "lat": 8.4828, "lng": 76.9591},
    {"name": "Pattom", "lat": 8.5257, "lng": 76.9426},
    {"name": "Kesavadasapuram", "lat": 8.5123, "lng": 76.9534},
    {"name": "PMG", "lat": 8.5072, "lng": 76.9586},
    {"name": "Sasthamangalam", "lat": 8.5082, "lng": 76.9703},
    {"name": "Jagathy", "lat": 8.4968, "lng": 76.9638},
    {"name": "Vellayambalam", "lat": 8.5110, "lng": 76.9623},
    {"name": "Kowdiar", "lat": 8.5189, "lng": 76.9544},
    {"name": "Peroorkada", "lat": 8.5398, "lng": 76.9713},
    {"name": "Ulloor", "lat": 8.5361, "lng": 76.9256},
    {"name": "Vazhuthacaud", "lat": 8.5012, "lng": 76.9589},
    {"name": "Medical College", "lat": 8.5254, "lng": 76.9117},
    {"name": "Kuravankonam", "lat": 8.5299, "lng": 76.9617},
    {"name": "Ambalamukku", "lat": 8.5350, "lng": 76.9497},
    {"name": "Poojapura", "lat": 8.4892, "lng": 76.9747},
    {"name": "Kovalam", "lat": 8.4004, "lng": 76.9787},
    {"name": "Varkala", "lat": 8.7379, "lng": 76.7163},
]

# Key destinations for distance calculations
DESTINATIONS = {
    "city_centre": {"lat": 8.4875, "lng": 76.9525, "name": "East Fort/Statue"},
    "technopark": {"lat": 8.5564, "lng": 76.8812, "name": "Technopark Phase 1"},
    "airport": {"lat": 8.4804, "lng": 76.9201, "name": "Trivandrum Airport"},
    "medical_college": {"lat": 8.5254, "lng": 76.9117, "name": "Medical College"},
    "secretariat": {"lat": 8.5042, "lng": 76.9600, "name": "Secretariat"},
    "ksrtc_stand": {"lat": 8.4885, "lng": 76.9506, "name": "KSRTC Bus Stand"},
}

# Noise sources
NOISE_SOURCES = {
    "airport": {"lat": 8.4804, "lng": 76.9201},
    "ksrtc_stand": {"lat": 8.4885, "lng": 76.9506},
    "railway_station": {"lat": 8.4890, "lng": 76.9494},
}


def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in km"""
    R = 6371
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


def get_travel_time(origin_lat, origin_lng, dest_lat, dest_lng):
    """Get travel time in minutes using Distance Matrix API"""
    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": f"{dest_lat},{dest_lng}",
        "mode": "driving",
        "key": GOOGLE_MAPS_API_KEY
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if data['rows'][0]['elements'][0]['status'] == 'OK':
            duration_seconds = data['rows'][0]['elements'][0]['duration']['value']
            return round(duration_seconds / 60)
        return None
    except Exception as e:
        print(f"  Error getting travel time: {e}")
        return None


def get_all_places_in_region(place_type, radius=5000):
    """
    Get ALL places of a type across the entire region (centered on Trivandrum).
    Returns list of places with their coordinates and details.
    """
    # Center of Trivandrum to capture all localities
    center_lat, center_lng = 8.5241, 76.9366
    
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    all_places = {}
    
    # Use multiple center points to cover more area
    search_centers = [
        (8.5241, 76.9366),  # Central TVM
        (8.4800, 76.9500),  # South (Statue area)
        (8.5600, 76.8800),  # Northwest (Technopark area)
        (8.5400, 76.9700),  # Northeast (Peroorkada area)
        (8.4000, 76.9800),  # Kovalam
        (8.7379, 76.7163),  # Varkala
    ]
    
    for center_lat, center_lng in search_centers:
        params = {
            "location": f"{center_lat},{center_lng}",
            "radius": radius,
            "type": place_type,
            "key": GOOGLE_MAPS_API_KEY
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            for place in data.get('results', []):
                place_id = place.get('place_id')
                if place_id and place_id not in all_places:
                    loc = place.get('geometry', {}).get('location', {})
                    all_places[place_id] = {
                        'place_id': place_id,
                        'name': place.get('name'),
                        'lat': loc.get('lat'),
                        'lng': loc.get('lng'),
                        'rating': place.get('rating'),
                        'type': place_type,
                    }
            
            time.sleep(0.3)  # Rate limiting
            
        except Exception as e:
            print(f"  Error fetching {place_type}: {e}")
    
    return list(all_places.values())


def find_nearest_locality(place_lat, place_lng, localities):
    """Find which locality is closest to a given place"""
    min_distance = float('inf')
    nearest = None
    
    for loc in localities:
        dist = haversine_distance(place_lat, place_lng, loc['lat'], loc['lng'])
        if dist < min_distance:
            min_distance = dist
            nearest = loc['name']
    
    return nearest, min_distance


def calculate_noise_score(lat, lng):
    """Calculate noise score based on distance from noise sources (higher = quieter)"""
    distances = []
    for source_name, source_coords in NOISE_SOURCES.items():
        dist = haversine_distance(lat, lng, source_coords['lat'], source_coords['lng'])
        distances.append(dist)
    
    avg_distance = sum(distances) / len(distances)
    score = min(10, max(1, avg_distance))
    return round(score, 1)


def calculate_flood_safety_score(elevation):
    """Calculate flood safety based on elevation (higher = safer)"""
    if elevation is None:
        return 5  # Default medium score
    # Trivandrum avg elevation ~15m. <5m = high risk, >30m = very safe
    if elevation < 5:
        return 2
    elif elevation < 10:
        return 4
    elif elevation < 15:
        return 5
    elif elevation < 25:
        return 7
    else:
        return 9


def calculate_job_proximity_score(travel_times):
    """Calculate job proximity score based on weighted travel times"""
    weights = {
        "technopark_time": 0.5,
        "city_centre_time": 0.3,
        "secretariat_time": 0.2,
    }
    
    total_weighted_time = 0
    for key, weight in weights.items():
        t = travel_times.get(key)
        if t:
            total_weighted_time += t * weight
    
    score = max(1, min(10, 11 - (total_weighted_time / 6)))
    return round(score, 1)


def main():
    print("\n" + "="*70)
    print("🏘️ COLLECTING DEDUPLICATED LOCALITY DATA")
    print("="*70)
    print("Each amenity will be counted for ONLY the nearest locality.\n")
    
    # Step 1: Collect travel times and basic data for each locality
    print("📍 Step 1: Collecting travel times for each locality...")
    locality_data = {}
    
    for loc in LOCALITIES:
        name = loc['name']
        print(f"\n  Processing {name}...")
        
        data = {
            "name": name,
            "latitude": loc['lat'],
            "longitude": loc['lng'],
        }
        
        # Travel times
        for dest_key, dest_info in DESTINATIONS.items():
            t = get_travel_time(loc['lat'], loc['lng'], dest_info['lat'], dest_info['lng'])
            data[f"{dest_key}_time"] = t
            time.sleep(0.2)
        
        # Noise and flood scores
        data['noise_score'] = calculate_noise_score(loc['lat'], loc['lng'])
        data['flood_safety_score'] = 5  # Default, could add elevation API call
        data['job_proximity_score'] = calculate_job_proximity_score(data)
        
        # Initialize amenity counts
        data['amenity_counts'] = {}
        data['amenity_ratings'] = {}
        
        locality_data[name] = data
    
    # Step 2: Collect ALL places across the region, then assign to nearest locality
    print("\n\n📍 Step 2: Collecting all amenities and assigning to nearest locality...")
    
    amenity_types = [
        "school", "hospital", "police", "fire_station", "bus_station",
        "park", "bank", "atm", "supermarket", "pharmacy", 
        "gym", "restaurant", "cafe", "real_estate_agency"
    ]
    
    # Track all places globally to prevent duplicates
    global_places = {}
    
    for amenity_type in amenity_types:
        print(f"\n  🔍 Searching for {amenity_type}s...")
        places = get_all_places_in_region(amenity_type, radius=5000)
        print(f"    Found {len(places)} unique {amenity_type}s across region")
        
        # Assign each place to the nearest locality
        for place in places:
            if not place.get('lat') or not place.get('lng'):
                continue
            
            nearest, distance = find_nearest_locality(
                place['lat'], place['lng'], LOCALITIES
            )
            
            # Only count if within 3km of the nearest locality
            if distance <= 3.0:
                key = f"{amenity_type}_count"
                rating_key = f"{amenity_type}_avg_rating"
                
                if key not in locality_data[nearest]['amenity_counts']:
                    locality_data[nearest]['amenity_counts'][key] = 0
                    locality_data[nearest]['amenity_ratings'][rating_key] = []
                
                locality_data[nearest]['amenity_counts'][key] += 1
                if place.get('rating'):
                    locality_data[nearest]['amenity_ratings'][rating_key].append(place['rating'])
        
        time.sleep(0.5)  # Rate limiting between amenity types
    
    # Step 3: Finalize data
    print("\n\n📍 Step 3: Finalizing data...")
    final_data = []
    
    for name, data in locality_data.items():
        # Flatten amenity counts
        for key, count in data['amenity_counts'].items():
            data[key] = count
        
        # Calculate average ratings
        for key, ratings in data['amenity_ratings'].items():
            if ratings:
                data[key] = round(sum(ratings) / len(ratings), 2)
            else:
                data[key] = None
        
        # Clean up
        del data['amenity_counts']
        del data['amenity_ratings']
        
        final_data.append(data)
        
        # Print summary
        print(f"\n  {name}:")
        print(f"    Schools: {data.get('school_count', 0)}, Hospitals: {data.get('hospital_count', 0)}")
        print(f"    Parks: {data.get('park_count', 0)}, Restaurants: {data.get('restaurant_count', 0)}")
    
    # Save results
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'deduplicated_locality_data.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n\n✅ Deduplicated data saved to: {output_file}")
    print("="*70)


if __name__ == '__main__':
    main()
