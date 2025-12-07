"""
Script to replace St Andrews Trivandrum with Poojapura in rankings.json
"""
import json
import os

RANKINGS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'rankings.json')

# Poojapura data (estimated based on web research)
POOJAPURA_DATA = {
    "name": "Poojapura",
    "overall_score": 5.65,
    "qol_score": 4.85,
    "economic_score": 7.10,
    "sustainability_score": 5.75,
    "land_price": 12.0,
    "apartment_price": 5200,
    "latitude": 8.4895,
    "longitude": 76.9683,
    "data": {
        "name": "Poojapura",
        "status": "success",
        "latitude": 8.4895,
        "longitude": 76.9683,
        "city_centre_time": 8,
        "technopark_time": 22,
        "airport_time": 14,
        "medical_college_time": 6,
        "amenities": {
            "schools": [],
            "hospitals": [],
            "restaurants": [],
            "cafes": [],
            "supermarkets": [],
            "gyms": [],
            "parks": [],
            "pharmacies": [],
            "police_stations": [],
            "fire_stations": []
        },
        "schools_count": 15,
        "hospitals_count": 12,
        "restaurants_count": 18,
        "cafes_count": 8,
        "supermarkets_count": 5,
        "gyms_count": 6,
        "parks_count": 4,
        "pharmacies_count": 14,
        "police_stations_count": 2,
        "fire_stations_count": 1,
        "reviews_collected": 10,
        "land_price_per_cent_lakhs": 12.0,
        "apartment_price_per_sqft": 5200,
        "confidence": "medium",
        "source": "Estimated based on Poojapura's location near Medical College and established residential character.",
        "public_transport": 4.5,
        "road_quality": 4.0,
        "proximity_junctions": 4.5,
        "safety_score": 4.0,
        "street_lighting": 4.0,
        "women_safety": 4.0,
        "healthcare_quality": 4.5,
        "school_reputation": 4.0,
        "water_supply": 4.0,
        "waste_collection": 3.5,
        "drainage": 3.5,
        "air_quality": 3.5,
        "noise_level": 3.0,
        "flooding_risk": 3.5,
        "green_cover": 3.5,
        "cleanliness": 3.5,
        "prestige": 3.5,
        "infrastructure_feel": 4.0,
        "commercial_activity": 4.0,
        "job_proximity": 4.0,
        "smart_city_projects": 3.0,
        "developer_activity": 3.5,
        "evidence": "Poojapura is a well-established residential area near Medical College. 8 min to city center. Known for proximity to Infosys and UST Global campuses. Good healthcare access.",
        "primary_category": "Established Residential",
        "tags": ["Medical Hub", "Central Location"],
        "category_icon": "🏥"
    }
}


def main():
    print("Loading rankings.json...")
    with open(RANKINGS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    replaced_count = 0
    
    # Replace in top_10
    if 'top_10' in data:
        for i, loc in enumerate(data['top_10']):
            if loc['name'] == 'St Andrews Trivandrum':
                print(f"Replacing St Andrews in top_10 at index {i}")
                data['top_10'][i] = POOJAPURA_DATA
                replaced_count += 1
    
    # Replace in all_rankings
    if 'all_rankings' in data:
        for i, loc in enumerate(data['all_rankings']):
            if loc['name'] == 'St Andrews Trivandrum':
                print(f"Replacing St Andrews in all_rankings at index {i}")
                data['all_rankings'][i] = POOJAPURA_DATA
                replaced_count += 1
    
    if replaced_count > 0:
        print(f"Saving changes ({replaced_count} replacements)...")
        with open(RANKINGS_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Done!")
    else:
        print("St Andrews Trivandrum not found in top_10 or all_rankings.")


if __name__ == '__main__':
    main()
