import json
import math
from typing import Dict, List, Tuple

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # Convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r

def deduplicate():
    print("="*60)
    print("Running Amenity Deduplication")
    print("="*60)

    # 1. Load Data
    with open('data_collection/output/automated_scores.json', 'r', encoding='utf-8') as f:
        localities = json.load(f)
    
    print(f"Loaded {len(localities)} localities.")
    
    # Registry to track every amenity instance
    # Key: place_id, Value: { 'dist': X, 'locality_name': Y }
    amenity_registry = {}
    
    # 2. First Pass: Find the closest locality for every unique amenity
    amenity_types = [
        'schools', 'hospitals', 'restaurants', 'cafes', 
        'supermarkets', 'gyms', 'parks', 'pharmacies', 
        'police_stations', 'fire_stations'
    ]
    
    total_duplicates_found = 0
    
    for loc in localities:
        loc_lat = loc['latitude']
        loc_lng = loc['longitude']
        
        # Check if 'amenities' key exists (it should with new script)
        if 'amenities' not in loc:
            print(f"⚠️ Warning: No detailed amenity data for {loc['name']}")
            continue
            
        for type_name in amenity_types:
            items = loc['amenities'].get(type_name, [])
            
            for item in items:
                pid = item['place_id']
                if not pid: continue # Skip if no ID
                
                # Calculate distance to THIS locality center
                dist = haversine_distance(loc_lat, loc_lng, item['lat'], item['lng'])
                
                # Register globally
                if pid not in amenity_registry:
                    amenity_registry[pid] = {
                        'closest_locality': loc['name'],
                        'min_dist': dist,
                        'name': item['name'],
                        'type': type_name
                    }
                else:
                    # Duplicate found!
                    total_duplicates_found += 1
                    # Is this locality closer?
                    if dist < amenity_registry[pid]['min_dist']:
                        amenity_registry[pid]['closest_locality'] = loc['name']
                        amenity_registry[pid]['min_dist'] = dist
    
    print(f"\nFound {len(amenity_registry)} unique amenities.")
    print(f"Identified {total_duplicates_found} overlapping instances to be removed.")
    
    # 3. Second Pass: Filter localities to keep ONLY the closest amenities
    deduped_localities = []
    
    for loc in localities:
        if 'amenities' not in loc:
            deduped_localities.append(loc)
            continue
            
        new_counts = {}
        
        for type_name in amenity_types:
            original_items = loc['amenities'].get(type_name, [])
            kept_items = []
            
            for item in original_items:
                pid = item['place_id']
                if not pid: 
                    kept_items.append(item) # Keep if no ID to be safe
                    continue
                    
                # ONLY keep if this locality is the closest one
                closest_owner = amenity_registry[pid]['closest_locality']
                if closest_owner == loc['name']:
                    kept_items.append(item)
            
            # Update the count
            loc[f'{type_name}_count'] = len(kept_items)
            new_counts[type_name] = len(kept_items)
            
            # Optional: Overwrite the detailed list with deduped one? 
            # Let's keep the detailed list as is for debugging, but the COUNT is what matters for ranking.
            # Actually, let's update the detailed list too so we can verify.
            loc['amenities'][type_name] = kept_items
            
        # Log the reduction
        print(f"\nLocation: {loc['name']}:")
        print(f"   Schools: {len(original_items)} -> {new_counts.get('schools', 0)}")
        print(f"   Hospitals: {len(loc['amenities'].get('hospitals', []))} -> {new_counts.get('hospitals', 0)}")
        
        deduped_localities.append(loc)

    # 4. Save
    output_file = 'data_collection/output/deduped_scores.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(deduped_localities, f, indent=2, ensure_ascii=False)
        
    print(f"\nDeduplication complete. Saved to {output_file}")

if __name__ == "__main__":
    deduplicate()
