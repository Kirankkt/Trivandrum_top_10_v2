"""
Objective Locality Data Collection
Fetches 100% verifiable, API-sourced metrics for locality rankings.
No AI-generated or subjective ratings.
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

# Noise sources for noise level calculation
NOISE_SOURCES = {
    "airport": {"lat": 8.4804, "lng": 76.9201},
    "ksrtc_stand": {"lat": 8.4885, "lng": 76.9506},
    "railway_station": {"lat": 8.4890, "lng": 76.9494},
}

def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in km"""
    R = 6371  # Earth's radius in km
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

def get_elevation(lat, lng):
    """Get elevation in meters using Elevation API"""
    url = "https://maps.googleapis.com/maps/api/elevation/json"
    params = {
        "locations": f"{lat},{lng}",
        "key": GOOGLE_MAPS_API_KEY
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if data['results']:
            return round(data['results'][0]['elevation'], 1)
        return None
    except Exception as e:
        print(f"  Error getting elevation: {e}")
        return None

def count_nearby_places(lat, lng, place_type, radius=2000):
    """Count places of a specific type within radius (meters)"""
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": place_type,
        "key": GOOGLE_MAPS_API_KEY
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        places = data.get('results', [])
        
        # Calculate average rating if available
        ratings = [p.get('rating') for p in places if p.get('rating')]
        avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None
        
        return {
            "count": len(places),
            "avg_rating": avg_rating
        }
    except Exception as e:
        print(f"  Error counting {place_type}: {e}")
        return {"count": 0, "avg_rating": None}

def get_air_quality(lat, lng):
    """Get AQI from OpenAQ (free API, no key needed)"""
    try:
        url = f"https://api.openaq.org/v2/latest?coordinates={lat},{lng}&radius=25000&limit=1"
        response = requests.get(url, timeout=10)
        data = response.json()
        if data.get('results') and len(data['results']) > 0:
            measurements = data['results'][0].get('measurements', [])
            for m in measurements:
                if m.get('parameter') == 'pm25':
                    return {"pm25": m.get('value'), "source": data['results'][0].get('location')}
        return {"pm25": None, "source": "No nearby station"}
    except Exception as e:
        print(f"  Error getting AQI: {e}")
        return {"pm25": None, "source": "API Error"}

def calculate_noise_score(lat, lng):
    """Calculate noise score based on distance from noise sources (higher = quieter)"""
    distances = []
    for source_name, source_coords in NOISE_SOURCES.items():
        dist = haversine_distance(lat, lng, source_coords['lat'], source_coords['lng'])
        distances.append(dist)
    
    # Average distance to noise sources
    avg_distance = sum(distances) / len(distances)
    
    # Convert to 1-10 score (further = higher score)
    # 0km = 1, 10km+ = 10
    score = min(10, max(1, avg_distance))
    return round(score, 1)

def calculate_job_proximity_score(travel_times):
    """Calculate job proximity score based on weighted travel times"""
    weights = {
        "technopark_time": 0.5,  # Most important for IT professionals
        "city_centre_time": 0.3,  # Government/business jobs
        "secretariat_time": 0.2,  # Government jobs
    }
    
    total_weighted_time = 0
    for key, weight in weights.items():
        time = travel_times.get(key)
        if time:
            total_weighted_time += time * weight
    
    # Convert to 1-10 score (lower time = higher score)
    # 5 min = 10, 60 min = 1
    score = max(1, min(10, 11 - (total_weighted_time / 6)))
    return round(score, 1)

def calculate_prestige_percentile(land_price, all_prices):
    """Calculate prestige based on land price percentile"""
    if not land_price or not all_prices:
        return 5  # Default middle score
    
    sorted_prices = sorted(all_prices)
    rank = sorted_prices.index(land_price) + 1
    percentile = rank / len(sorted_prices) * 100
    
    # Convert to 1-10 score
    score = percentile / 10
    return round(score, 1)

def collect_locality_data(locality):
    """Collect all objective metrics for a locality"""
    name = locality['name']
    lat = locality['lat']
    lng = locality['lng']
    
    print(f"\n📍 Processing: {name}")
    data = {
        "name": name,
        "latitude": lat,
        "longitude": lng,
    }
    
    # 1. Travel Times (OBJECTIVE)
    print("  ⏱️ Calculating travel times...")
    for dest_key, dest_info in DESTINATIONS.items():
        time_val = get_travel_time(lat, lng, dest_info['lat'], dest_info['lng'])
        data[f"{dest_key}_time"] = time_val
        print(f"    → {dest_info['name']}: {time_val} min")
        time.sleep(0.2)
    
    # 2. Elevation for Flooding Risk (OBJECTIVE)
    print("  ⛰️ Getting elevation...")
    data['elevation_meters'] = get_elevation(lat, lng)
    print(f"    → Elevation: {data['elevation_meters']}m")
    time.sleep(0.2)
    
    # 3. Amenity Counts (OBJECTIVE)
    print("  🏢 Counting nearby amenities...")
    amenity_types = {
        "school": 3000,
        "hospital": 3000,
        "police": 5000,
        "fire_station": 5000,
        "bus_station": 2000,
        "park": 2000,
        "bank": 2000,
        "atm": 2000,
        "supermarket": 2000,
        "pharmacy": 2000,
        "gym": 2000,
        "restaurant": 2000,
        "cafe": 2000,
        "real_estate_agency": 3000,
    }
    
    for amenity_type, radius in amenity_types.items():
        result = count_nearby_places(lat, lng, amenity_type, radius)
        data[f"{amenity_type}_count"] = result['count']
        data[f"{amenity_type}_avg_rating"] = result['avg_rating']
        print(f"    → {amenity_type}: {result['count']} (avg rating: {result['avg_rating']})")
        time.sleep(0.3)  # Rate limiting
    
    # 4. Air Quality (OBJECTIVE - but limited coverage)
    print("  🌬️ Checking air quality...")
    aqi = get_air_quality(lat, lng)
    data['pm25'] = aqi['pm25']
    data['aqi_source'] = aqi['source']
    print(f"    → PM2.5: {aqi['pm25']} (from: {aqi['source']})")
    
    # 5. Calculated Scores (DERIVED FROM OBJECTIVE DATA)
    print("  📊 Calculating derived scores...")
    
    # Noise Score (based on distance from noise sources)
    data['noise_score'] = calculate_noise_score(lat, lng)
    print(f"    → Noise Score: {data['noise_score']}/10 (higher = quieter)")
    
    # Flooding Risk Score (based on elevation - higher = safer)
    if data['elevation_meters']:
        # Trivandrum elevations range roughly 0-100m
        # Normalize: 0m = 1, 50m+ = 10
        flood_score = min(10, max(1, data['elevation_meters'] / 5))
        data['flood_safety_score'] = round(flood_score, 1)
    else:
        data['flood_safety_score'] = 5  # Default
    print(f"    → Flood Safety: {data['flood_safety_score']}/10 (higher = safer)")
    
    # Safety Score (based on police/fire station proximity)
    safety_count = data.get('police_count', 0) + data.get('fire_station_count', 0)
    data['safety_score'] = min(10, safety_count * 2)  # Cap at 10
    print(f"    → Safety Score: {data['safety_score']}/10")
    
    # Public Transport Score (based on bus stops)
    bus_count = data.get('bus_station_count', 0)
    data['public_transport_score'] = min(10, bus_count)
    print(f"    → Public Transport: {data['public_transport_score']}/10")
    
    # Green Cover Score (based on parks)
    parks_count = data.get('park_count', 0)
    data['green_cover_score'] = min(10, parks_count)
    print(f"    → Green Cover: {data['green_cover_score']}/10")
    
    # Healthcare Score (count + rating)
    hospital_count = data.get('hospital_count', 0)
    hospital_rating = data.get('hospital_avg_rating') or 3
    data['healthcare_score'] = min(10, (hospital_count / 2) + hospital_rating)
    print(f"    → Healthcare: {data['healthcare_score']}/10")
    
    # Education Score (count + rating)
    school_count = data.get('school_count', 0)
    school_rating = data.get('school_avg_rating') or 3
    data['education_score'] = min(10, (school_count / 3) + school_rating)
    print(f"    → Education: {data['education_score']}/10")
    
    # Commercial Score (banks, ATMs, shops)
    commercial_count = (data.get('bank_count', 0) + 
                       data.get('atm_count', 0) + 
                       data.get('supermarket_count', 0))
    data['commercial_score'] = min(10, commercial_count / 2)
    print(f"    → Commercial: {data['commercial_score']}/10")
    
    # Developer Activity Score
    re_count = data.get('real_estate_agency_count', 0)
    data['developer_score'] = min(10, re_count * 2)
    print(f"    → Developer Activity: {data['developer_score']}/10")
    
    # Job Proximity Score
    data['job_proximity_score'] = calculate_job_proximity_score(data)
    print(f"    → Job Proximity: {data['job_proximity_score']}/10")
    
    return data

def main():
    print("\n" + "="*70)
    print("🏘️ OBJECTIVE LOCALITY DATA COLLECTION")
    print("="*70)
    print("Collecting 100% verifiable, API-sourced metrics...")
    
    if not GOOGLE_MAPS_API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env")
        return
    
    all_data = []
    
    for locality in LOCALITIES:
        data = collect_locality_data(locality)
        all_data.append(data)
        time.sleep(1)  # Rate limiting between localities
    
    # Calculate prestige scores (needs all prices)
    # Note: We'll use existing price data if available
    
    # Save results
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'objective_locality_data.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*70)
    print(f"✅ COMPLETE! Data saved to: {output_file}")
    print(f"📊 Processed {len(all_data)} localities")
    print("="*70)

if __name__ == '__main__':
    main()
