"""
Objective Locality Scoring Engine
Calculates overall rankings using only API-sourced, verifiable metrics.
No AI-generated or subjective ratings.
"""

import os
import sys
import json

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

class ObjectiveScoringEngine:
    """
    Scores localities based on 100% objective, API-sourced data.
    """
    
    # Category weights (must sum to 1.0)
    CATEGORY_WEIGHTS = {
        "accessibility": 0.25,    # Travel times to key destinations
        "amenities": 0.25,        # Schools, hospitals, daily needs
        "safety": 0.15,           # Police, fire stations
        "environment": 0.15,      # Green cover, noise, air quality
        "economy": 0.20,          # Job proximity, commercial activity
    }
    
    # Travel time scoring: lower time = higher score
    # Reference: 5 min = 10/10, 60 min = 0/10
    @staticmethod
    def score_travel_time(minutes, is_critical=False):
        """Convert travel time (minutes) to 0-10 score"""
        if minutes is None:
            return 5  # Default
        # Formula: 10 - (time / 6), capped between 0-10
        score = max(0, min(10, 10 - (minutes / 6)))
        return round(score, 1)
    
    @staticmethod
    def score_amenity_count(count, max_expected=20):
        """Convert amenity count to 0-10 score"""
        if count is None:
            return 0
        # Normalize: 20+ = 10, 0 = 0
        score = min(10, (count / max_expected) * 10)
        return round(score, 1)
    
    @staticmethod
    def score_amenity_with_rating(count, avg_rating, max_expected=20):
        """Combine count and quality into single score"""
        count_score = min(10, (count / max_expected) * 10) if count else 0
        rating_score = (avg_rating - 1) * 2.5 if avg_rating else 5  # 1-5 -> 0-10
        
        # 60% weight on count, 40% on rating
        combined = (count_score * 0.6) + (rating_score * 0.4)
        return round(combined, 1)
    
    def calculate_accessibility_score(self, data):
        """
        Accessibility Score (25% of total)
        Based on travel times to key destinations.
        """
        weights = {
            "technopark_time": 0.30,      # IT professionals
            "city_centre_time": 0.25,     # General convenience
            "secretariat_time": 0.15,     # Government jobs
            "airport_time": 0.15,         # NRI convenience
            "ksrtc_stand_time": 0.15,     # Public transport hub
        }
        
        total = 0
        for field, weight in weights.items():
            time_val = data.get(field)
            score = self.score_travel_time(time_val)
            total += score * weight
        
        return round(total, 1)
    
    def calculate_amenities_score(self, data):
        """
        Amenities Score (25% of total)
        Based on nearby essential services.
        """
        metrics = {
            "healthcare": {
                "count": data.get("hospital_count", 0),
                "rating": data.get("hospital_avg_rating"),
                "weight": 0.25
            },
            "education": {
                "count": data.get("school_count", 0),
                "rating": data.get("school_avg_rating"),
                "weight": 0.20
            },
            "shopping": {
                "count": (data.get("supermarket_count", 0) + 
                         data.get("pharmacy_count", 0)),
                "rating": None,
                "weight": 0.20
            },
            "banking": {
                "count": (data.get("bank_count", 0) + 
                         data.get("atm_count", 0)),
                "rating": data.get("bank_avg_rating"),
                "weight": 0.15
            },
            "lifestyle": {
                "count": (data.get("restaurant_count", 0) + 
                         data.get("cafe_count", 0) +
                         data.get("gym_count", 0)),
                "rating": data.get("restaurant_avg_rating"),
                "weight": 0.20
            },
        }
        
        total = 0
        for name, config in metrics.items():
            if config["rating"]:
                score = self.score_amenity_with_rating(
                    config["count"], config["rating"], max_expected=40
                )
            else:
                score = self.score_amenity_count(config["count"], max_expected=40)
            total += score * config["weight"]
        
        return round(total, 1)
    
    def calculate_safety_score(self, data):
        """
        Safety Score (15% of total)
        Based on emergency services proximity.
        """
        police = data.get("police_count", 0)
        fire = data.get("fire_station_count", 0)
        
        # Police weighted more heavily
        police_score = min(10, police * 0.5)  # 20 = 10
        fire_score = min(10, fire * 2)        # 5 = 10
        
        total = (police_score * 0.7) + (fire_score * 0.3)
        return round(total, 1)
    
    def calculate_environment_score(self, data):
        """
        Environment Score (15% of total)
        Based on green cover, noise, flood risk.
        """
        # Green cover (parks)
        parks = data.get("park_count", 0)
        green_score = min(10, parks * 0.5)  # 20 = 10
        
        # Noise (distance from noise sources - already calculated)
        noise_score = data.get("noise_score", 5)
        
        # Flood safety (from elevation)
        flood_score = data.get("flood_safety_score", 5)
        
        # Weights: Green 40%, Noise 30%, Flood 30%
        total = (green_score * 0.4) + (noise_score * 0.3) + (flood_score * 0.3)
        return round(total, 1)
    
    def calculate_economy_score(self, data):
        """
        Economy Score (20% of total)
        Based on job proximity and development activity.
        """
        # Job proximity (already calculated)
        job_score = data.get("job_proximity_score", 5)
        
        # Commercial activity (banks, shops)
        commercial_count = (data.get("bank_count", 0) + 
                           data.get("supermarket_count", 0) +
                           data.get("atm_count", 0))
        commercial_score = min(10, commercial_count / 5)
        
        # Developer activity
        developer = data.get("real_estate_agency_count", 0)
        developer_score = min(10, developer * 0.5)
        
        # Weights: Jobs 50%, Commercial 30%, Development 20%
        total = (job_score * 0.5) + (commercial_score * 0.3) + (developer_score * 0.2)
        return round(total, 1)
    
    def calculate_overall_score(self, data):
        """
        Calculate final overall score (0-10 scale)
        """
        scores = {
            "accessibility": self.calculate_accessibility_score(data),
            "amenities": self.calculate_amenities_score(data),
            "safety": self.calculate_safety_score(data),
            "environment": self.calculate_environment_score(data),
            "economy": self.calculate_economy_score(data),
        }
        
        overall = 0
        for category, score in scores.items():
            weight = self.CATEGORY_WEIGHTS[category]
            overall += score * weight
        
        return {
            "overall": round(overall, 2),
            "breakdown": scores
        }
    
    def rank_localities(self, localities_data):
        """
        Rank all localities by overall score
        """
        ranked = []
        
        for locality in localities_data:
            result = self.calculate_overall_score(locality)
            ranked.append({
                "name": locality["name"],
                "overall_score": result["overall"],
                "breakdown": result["breakdown"],
                "data": locality
            })
        
        # Sort by overall score (descending)
        ranked.sort(key=lambda x: x["overall_score"], reverse=True)
        
        # Add rank
        for i, item in enumerate(ranked):
            item["rank"] = i + 1
        
        return ranked


def main():
    print("\n" + "="*70)
    print("📊 OBJECTIVE LOCALITY RANKING")
    print("="*70)
    
    # Load objective data
    data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'objective_locality_data.json')
    
    if not os.path.exists(data_file):
        print("❌ Error: objective_locality_data.json not found. Run collect_objective_data.py first.")
        return
    
    with open(data_file, 'r', encoding='utf-8') as f:
        localities_data = json.load(f)
    
    print(f"Loaded data for {len(localities_data)} localities\n")
    
    # Calculate rankings
    engine = ObjectiveScoringEngine()
    ranked = engine.rank_localities(localities_data)
    
    # Display results
    print("🏆 FINAL RANKINGS (100% Objective Data)")
    print("-" * 70)
    
    for item in ranked:
        print(f"\n#{item['rank']:2d} | {item['name']:<20} | Score: {item['overall_score']:.2f}/10")
        print(f"    Accessibility: {item['breakdown']['accessibility']:.1f} | "
              f"Amenities: {item['breakdown']['amenities']:.1f} | "
              f"Safety: {item['breakdown']['safety']:.1f} | "
              f"Environment: {item['breakdown']['environment']:.1f} | "
              f"Economy: {item['breakdown']['economy']:.1f}")
    
    # Save results
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'objective_rankings.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "methodology": "100% Objective API-Sourced Data",
            "last_updated": "2024-12-10",
            "category_weights": ObjectiveScoringEngine.CATEGORY_WEIGHTS,
            "rankings": ranked
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Rankings saved to: {output_file}")
    print("="*70)


if __name__ == '__main__':
    main()
