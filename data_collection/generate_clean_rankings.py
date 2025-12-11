"""
Generate Clean Rankings
Combines objective locality data with price data to produce clean rankings.
Uses only API-sourced metrics - no AI-generated scores.
"""

import os
import sys
import json

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

class CleanScoringEngine:
    """
    Scores localities using only objective, verifiable data.
    Includes price-based prestige scoring.
    """
    
    # Category weights (sum to 1.0)
    CATEGORY_WEIGHTS = {
        "accessibility": 0.20,     # Travel times
        "amenities": 0.25,         # Schools, hospitals, shops
        "safety": 0.15,            # Police, fire stations  
        "environment": 0.15,       # Parks, noise, flood risk
        "economy": 0.15,           # Job proximity, commercial
        "prestige": 0.10,          # Price-based (higher = more prestigious)
    }
    
    @staticmethod
    def score_travel_time(minutes, max_time=60):
        """Lower time = higher score. 5 min = 10, 60 min = 0"""
        if minutes is None:
            return 5
        score = max(0, min(10, 10 - (minutes / 6)))
        return round(score, 1)
    
    @staticmethod  
    def score_count(count, max_expected=20):
        """Convert count to 0-10 score"""
        if count is None:
            return 0
        return round(min(10, (count / max_expected) * 10), 1)
    
    @staticmethod
    def score_with_rating(count, rating, max_expected=20):
        """Combine count and rating (60/40 weight)"""
        count_score = min(10, (count / max_expected) * 10) if count else 0
        rating_score = ((rating or 3) - 1) * 2.5  # 1-5 -> 0-10
        return round((count_score * 0.6) + (rating_score * 0.4), 1)
    
    def calculate_accessibility(self, data):
        """Travel times to key destinations (20%)"""
        weights = {
            "technopark_time": 0.30,
            "city_centre_time": 0.25,
            "secretariat_time": 0.15,
            "airport_time": 0.15,
            "ksrtc_stand_time": 0.15,
        }
        total = sum(
            self.score_travel_time(data.get(field)) * weight 
            for field, weight in weights.items()
        )
        return round(total, 1)
    
    def calculate_amenities(self, data):
        """Schools, hospitals, shops nearby (25%)"""
        components = {
            "healthcare": self.score_with_rating(
                data.get("hospital_count", 0),
                data.get("hospital_avg_rating"),
                max_expected=20
            ) * 0.25,
            "education": self.score_with_rating(
                data.get("school_count", 0),
                data.get("school_avg_rating"),
                max_expected=20
            ) * 0.20,
            "shopping": self.score_count(
                (data.get("supermarket_count", 0) + data.get("pharmacy_count", 0)),
                max_expected=40
            ) * 0.20,
            "banking": self.score_count(
                (data.get("bank_count", 0) + data.get("atm_count", 0)),
                max_expected=40
            ) * 0.15,
            "lifestyle": self.score_count(
                (data.get("restaurant_count", 0) + data.get("cafe_count", 0) + data.get("gym_count", 0)),
                max_expected=60
            ) * 0.20,
        }
        return round(sum(components.values()), 1)
    
    def calculate_safety(self, data):
        """Police and fire station proximity (15%)"""
        police = data.get("police_count", 0)
        fire = data.get("fire_station_count", 0)
        
        police_score = min(10, police * 0.5)  # 20 stations = 10
        fire_score = min(10, fire * 2)        # 5 stations = 10
        
        return round((police_score * 0.7) + (fire_score * 0.3), 1)
    
    def calculate_environment(self, data):
        """Parks, noise, flood risk (15%)"""
        green = self.score_count(data.get("park_count", 0), max_expected=20)
        noise = data.get("noise_score", 5)  # Already 1-10, higher = quieter
        flood = data.get("flood_safety_score", 5)  # Already 1-10, higher = safer
        
        return round((green * 0.4) + (noise * 0.3) + (flood * 0.3), 1)
    
    def calculate_economy(self, data):
        """Job proximity and commercial activity (15%)"""
        job_proximity = data.get("job_proximity_score", 5)
        
        commercial = self.score_count(
            (data.get("bank_count", 0) + data.get("supermarket_count", 0)),
            max_expected=40
        )
        
        developer = self.score_count(
            data.get("real_estate_agency_count", 0),
            max_expected=20
        )
        
        return round((job_proximity * 0.5) + (commercial * 0.3) + (developer * 0.2), 1)
    
    def calculate_prestige(self, land_price, all_prices):
        """Price-based prestige (10%) - higher price = higher prestige"""
        if not land_price or not all_prices:
            return 5.0
        
        sorted_prices = sorted(all_prices)
        # Find percentile rank
        rank = sum(1 for p in sorted_prices if p <= land_price)
        percentile = rank / len(sorted_prices)
        
        # Convert to 0-10 score
        return round(percentile * 10, 1)
    
    def calculate_overall(self, data, all_prices):
        """Calculate final score with all categories"""
        scores = {
            "accessibility": self.calculate_accessibility(data),
            "amenities": self.calculate_amenities(data),
            "safety": self.calculate_safety(data),
            "environment": self.calculate_environment(data),
            "economy": self.calculate_economy(data),
            "prestige": self.calculate_prestige(
                data.get("land_price"), 
                all_prices
            ),
        }
        
        overall = sum(
            scores[cat] * weight 
            for cat, weight in self.CATEGORY_WEIGHTS.items()
        )
        
        return {
            "overall": round(overall, 2),
            "breakdown": scores
        }


def load_price_data():
    """Load price data from existing rankings.json"""
    rankings_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'rankings.json')
    
    if not os.path.exists(rankings_file):
        return {}
    
    with open(rankings_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract prices from all_rankings
    prices = {}
    for loc in data.get('all_rankings', []):
        name = loc.get('name')
        if name:
            prices[name] = {
                'land_price': loc.get('land_price') or loc.get('data', {}).get('land_price_per_cent_lakhs'),
                'apartment_price': loc.get('apartment_price') or loc.get('data', {}).get('apartment_price_per_sqft'),
            }
    
    return prices


def main():
    print("\n" + "="*70)
    print("🏘️ GENERATING CLEAN RANKINGS (Objective Data Only)")
    print("="*70)
    
    # Load objective locality data
    obj_data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'objective_locality_data.json')
    
    if not os.path.exists(obj_data_file):
        print("❌ Error: objective_locality_data.json not found")
        return
    
    with open(obj_data_file, 'r', encoding='utf-8') as f:
        localities = json.load(f)
    
    print(f"✓ Loaded {len(localities)} localities from objective data")
    
    # Load price data
    price_data = load_price_data()
    print(f"✓ Loaded prices for {len(price_data)} localities")
    
    # Merge prices into objective data
    all_prices = []
    for loc in localities:
        name = loc['name']
        if name in price_data:
            loc['land_price'] = price_data[name]['land_price']
            loc['apartment_price'] = price_data[name]['apartment_price']
            if loc['land_price']:
                all_prices.append(loc['land_price'])
    
    print(f"✓ Merged {len(all_prices)} price data points")
    
    # Calculate scores
    engine = CleanScoringEngine()
    ranked = []
    
    for loc in localities:
        result = engine.calculate_overall(loc, all_prices)
        ranked.append({
            "name": loc["name"],
            "overall_score": result["overall"],
            "breakdown": result["breakdown"],
            "land_price": loc.get("land_price"),
            "apartment_price": loc.get("apartment_price"),
            "data": {
                # Only objective fields
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
                "city_centre_time": loc.get("city_centre_time"),
                "technopark_time": loc.get("technopark_time"),
                "airport_time": loc.get("airport_time"),
                "medical_college_time": loc.get("medical_college_time"),
                "secretariat_time": loc.get("secretariat_time"),
                "school_count": loc.get("school_count"),
                "school_avg_rating": loc.get("school_avg_rating"),
                "hospital_count": loc.get("hospital_count"),
                "hospital_avg_rating": loc.get("hospital_avg_rating"),
                "police_count": loc.get("police_count"),
                "fire_station_count": loc.get("fire_station_count"),
                "park_count": loc.get("park_count"),
                "bank_count": loc.get("bank_count"),
                "supermarket_count": loc.get("supermarket_count"),
                "pharmacy_count": loc.get("pharmacy_count"),
                "restaurant_count": loc.get("restaurant_count"),
                "cafe_count": loc.get("cafe_count"),
                "gym_count": loc.get("gym_count"),
                "real_estate_agency_count": loc.get("real_estate_agency_count"),
                "bus_station_count": loc.get("bus_station_count"),
                "noise_score": loc.get("noise_score"),
                "flood_safety_score": loc.get("flood_safety_score"),
                "elevation_meters": loc.get("elevation_meters"),
                "job_proximity_score": loc.get("job_proximity_score"),
            }
        })
    
    # Sort by score
    ranked.sort(key=lambda x: x["overall_score"], reverse=True)
    
    # Add ranks
    for i, item in enumerate(ranked):
        item["rank"] = i + 1
    
    # Display results
    print("\n🏆 CLEAN RANKINGS (6 Categories)")
    print("-" * 70)
    
    for item in ranked[:10]:
        print(f"\n#{item['rank']:2d} | {item['name']:<18} | Score: {item['overall_score']:.2f}/10")
        b = item['breakdown']
        print(f"    Access: {b['accessibility']:.1f} | Amenities: {b['amenities']:.1f} | "
              f"Safety: {b['safety']:.1f} | Env: {b['environment']:.1f} | "
              f"Economy: {b['economy']:.1f} | Prestige: {b['prestige']:.1f}")
        print(f"    💰 Land: ₹{item.get('land_price', 'N/A')}L/cent | "
              f"Apt: ₹{item.get('apartment_price', 'N/A')}/sqft")
    
    # Save clean rankings
    output = {
        "methodology": "100% Objective API-Sourced Data + Price-Based Prestige",
        "category_weights": CleanScoringEngine.CATEGORY_WEIGHTS,
        "data_sources": {
            "travel_times": "Google Distance Matrix API",
            "amenities": "Google Places API (counts + ratings)",
            "noise": "Calculated from distance to airport/bus station",
            "flood_risk": "Google Elevation API",
            "prices": "Serper + Gemini extraction from real estate listings"
        },
        "top_10": ranked[:10],
        "all_rankings": ranked
    }
    
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'clean_rankings.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Clean rankings saved to: {output_file}")
    print("="*70)


if __name__ == '__main__':
    main()
