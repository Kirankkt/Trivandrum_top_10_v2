"""
Map Dining Establishments to Localities
Creates connections between restaurants/cafes/hotels and the 20 ranked localities.
"""

import json
import os
import re
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def load_data():
    """Load all necessary data files"""
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')

    with open(os.path.join(data_dir, 'restaurants.json'), 'r', encoding='utf-8') as f:
        restaurants = json.load(f)
    with open(os.path.join(data_dir, 'cafes.json'), 'r', encoding='utf-8') as f:
        cafes = json.load(f)
    with open(os.path.join(data_dir, 'hotels.json'), 'r', encoding='utf-8') as f:
        hotels = json.load(f)
    with open(os.path.join(data_dir, 'clean_rankings.json'), 'r', encoding='utf-8') as f:
        rankings = json.load(f)

    localities = [loc['name'] for loc in rankings['all_rankings']]

    return restaurants, cafes, hotels, localities

def extract_locality_from_address(address, localities):
    """
    Extract locality name from address string.
    Uses fuzzy matching to handle variations like:
    - "Kesavadasapuram-Ulloor" -> "Kesavadasapuram"
    - "near Palayam" -> "Statue" (Palayam is central)
    """
    if not address:
        return None

    address_lower = address.lower()

    # Direct name matching
    for locality in localities:
        locality_lower = locality.lower()
        # Check for exact match or hyphenated match
        if locality_lower in address_lower or locality_lower.replace(' ', '') in address_lower.replace(' ', ''):
            return locality

    # Special mappings for landmarks/areas within localities
    landmark_mappings = {
        'palayam': 'Statue',
        'east fort': 'Statue',
        'secretariat': 'Statue',
        'thampanoor': 'Enchakkal',
        'central station': 'Enchakkal',
        'vikas bhavan': 'Vazhuthacaud',
        'lulu mall': 'Ulloor',
        'akkulam': 'Ulloor',
        'medical college': 'Medical College',
        'kumarapuram': 'Medical College',
        'kowdiar palace': 'Kowdiar',
        'technopark': 'Kazhakuttom',
        'infosys': 'Kazhakuttom',
        'kovalam beach': 'Kovalam',
        'varkala cliff': 'Varkala',
        'attukal': 'Kesavadasapuram',
        'museum': 'Vellayambalam',
        'napier': 'Vellayambalam',
    }

    for landmark, locality in landmark_mappings.items():
        if landmark in address_lower:
            return locality

    return None

def map_establishments_to_localities(establishments, localities, category):
    """Add locality field to each establishment"""
    mapped = []
    unmatched = []

    for est in establishments:
        locality = extract_locality_from_address(est['address'], localities)

        est_copy = est.copy()
        est_copy['locality'] = locality

        if locality:
            mapped.append(est_copy)
        else:
            unmatched.append(est_copy)

    print(f"\n{category.upper()}:")
    print(f"  ✅ Mapped to localities: {len(mapped)}/{len(establishments)}")
    print(f"  ❌ Unmatched: {len(unmatched)}")

    if unmatched:
        print(f"  Unmatched addresses:")
        for u in unmatched[:5]:
            print(f"    - {u['name'][:30]:30} | {u['address'][:50]}")

    return mapped + unmatched

def calculate_locality_dining_stats(restaurants, cafes, hotels, localities):
    """Calculate dining statistics for each locality"""

    stats = {}

    for locality in localities:
        locality_restaurants = [r for r in restaurants if r.get('locality') == locality]
        locality_cafes = [c for c in cafes if c.get('locality') == locality]
        locality_hotels = [h for h in hotels if h.get('locality') == locality]

        # Top establishments
        top_restaurant = max(locality_restaurants, key=lambda x: x['score']) if locality_restaurants else None
        top_cafe = max(locality_cafes, key=lambda x: x['score']) if locality_cafes else None
        top_hotel = max(locality_hotels, key=lambda x: x['score']) if locality_hotels else None

        # Calculate dining scene score (0-10)
        # Based on number and quality of establishments
        dining_scene_score = 0
        if locality_restaurants:
            dining_scene_score += min(5, len(locality_restaurants) * 0.5 + max([r['rating'] for r in locality_restaurants]) - 3)
        if locality_cafes:
            dining_scene_score += min(3, len(locality_cafes) * 0.3 + max([c['rating'] for c in locality_cafes]) * 0.5)
        if locality_hotels:
            dining_scene_score += min(2, len(locality_hotels) * 0.2)

        stats[locality] = {
            'restaurant_count': len(locality_restaurants),
            'cafe_count': len(locality_cafes),
            'hotel_count': len(locality_hotels),
            'total_dining_count': len(locality_restaurants) + len(locality_cafes) + len(locality_hotels),
            'dining_scene_score': round(min(10, dining_scene_score), 1),
            'top_restaurant': {
                'name': top_restaurant['name'],
                'score': top_restaurant['score'],
                'rating': top_restaurant['rating'],
                'reviews': top_restaurant['reviews']
            } if top_restaurant else None,
            'top_cafe': {
                'name': top_cafe['name'],
                'score': top_cafe['score'],
                'rating': top_cafe['rating'],
                'reviews': top_cafe['reviews']
            } if top_cafe else None,
            'top_hotel': {
                'name': top_hotel['name'],
                'score': top_hotel['score'],
                'rating': top_hotel['rating'],
                'reviews': top_hotel['reviews']
            } if top_hotel else None
        }

    return stats

def main():
    print("\n" + "="*70)
    print("🍽️ MAPPING DINING ESTABLISHMENTS TO LOCALITIES")
    print("="*70)

    # Load data
    restaurants, cafes, hotels, localities = load_data()

    print(f"\n📊 Loaded:")
    print(f"  Restaurants: {len(restaurants)}")
    print(f"  Cafes: {len(cafes)}")
    print(f"  Hotels: {len(hotels)}")
    print(f"  Localities: {len(localities)}")

    # Map establishments
    restaurants_mapped = map_establishments_to_localities(restaurants, localities, 'Restaurants')
    cafes_mapped = map_establishments_to_localities(cafes, localities, 'Cafes')
    hotels_mapped = map_establishments_to_localities(hotels, localities, 'Hotels')

    # Calculate stats
    print("\n" + "="*70)
    print("📈 CALCULATING LOCALITY DINING STATS")
    print("="*70)

    dining_stats = calculate_locality_dining_stats(restaurants_mapped, cafes_mapped, hotels_mapped, localities)

    # Display top dining localities
    sorted_localities = sorted(dining_stats.items(), key=lambda x: x[1]['dining_scene_score'], reverse=True)

    print("\n🏆 TOP DINING LOCALITIES:")
    print("-" * 70)
    for i, (locality, stats) in enumerate(sorted_localities[:10], 1):
        print(f"\n#{i} {locality} (Score: {stats['dining_scene_score']}/10)")
        print(f"   Restaurants: {stats['restaurant_count']}, Cafes: {stats['cafe_count']}, Hotels: {stats['hotel_count']}")
        if stats['top_restaurant']:
            print(f"   🍽️  {stats['top_restaurant']['name']} ({stats['top_restaurant']['rating']}⭐)")
        if stats['top_cafe']:
            print(f"   ☕ {stats['top_cafe']['name']} ({stats['top_cafe']['rating']}⭐)")

    # Save mapped data
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')

    with open(os.path.join(data_dir, 'restaurants.json'), 'w', encoding='utf-8') as f:
        json.dump(restaurants_mapped, f, indent=2, ensure_ascii=False)

    with open(os.path.join(data_dir, 'cafes.json'), 'w', encoding='utf-8') as f:
        json.dump(cafes_mapped, f, indent=2, ensure_ascii=False)

    with open(os.path.join(data_dir, 'hotels.json'), 'w', encoding='utf-8') as f:
        json.dump(hotels_mapped, f, indent=2, ensure_ascii=False)

    with open(os.path.join(data_dir, 'locality_dining_stats.json'), 'w', encoding='utf-8') as f:
        json.dump(dining_stats, f, indent=2, ensure_ascii=False)

    print("\n✅ Saved updated files:")
    print("   - data/restaurants.json (with locality field)")
    print("   - data/cafes.json (with locality field)")
    print("   - data/hotels.json (with locality field)")
    print("   - data/locality_dining_stats.json (new)")
    print("="*70)

if __name__ == '__main__':
    main()
