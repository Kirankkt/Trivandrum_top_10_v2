"""
Calculate Top 10 Rankings from Collected Data
Based on EoLI-inspired weighted scoring
"""

import json
import sys

# Fix Windows encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def calculate_overall_score(data):
    """Calculate overall score using weighted formula"""
    
    # PILLAR 1: Quality of Life (55%)
    qol_score = 0
    qol_weight = 0.55
    
    # Accessibility (18% of total = 32.7% of QoL)
    accessibility = (
        normalize(data.get('city_centre_time', 30), 5, 45, invert=True) * 0.25 +
        normalize(data.get('technopark_time', 35), 10, 60, invert=True) * 0.25 +
        normalize(data.get('airport_time', 30), 10, 50, invert=True) * 0.15 +
        normalize(data.get('medical_college_time', 20), 2, 40, invert=True) * 0.15 +
        (data.get('public_transport', 3) / 5.0) * 0.10 +
        (data.get('road_quality', 3) / 5.0) * 0.10
    ) / 6
    
    # Safety (12% of total = 21.8% of QoL)
    safety = (data.get('safety_score', 3) / 5.0)
    
    # Infrastructure/Services (8% of total = 14.5% of QoL)
    services = (
        (5 - data.get('flooding_risk', 3)) / 5.0 * 0.4 +  # Invert flooding
        (data.get('cleanliness', 3) / 5.0) * 0.3 +
        normalize(data.get('hospitals_count', 10), 5, 25) * 0.3
    )
    
    # Education (7% of total = 12.7% of QoL)
    education = (
        normalize(data.get('schools_count', 10), 5, 25) * 0.6 +
        (data.get('school_quality', 3) / 5.0) * 0.4
    )
    
    # Recreation (7% of total = 12.7% of QoL)
    recreation = (
        normalize(data.get('restaurants_count', 10), 5, 25) * 0.3 +
        normalize(data.get('cafes_count', 10), 5, 25) * 0.2 +
        normalize(data.get('supermarkets_count', 10), 5, 25) * 0.2 +
        normalize(data.get('gyms_count', 5), 2, 15) * 0.3
    )
    
    # Health (3% of total = 5.5% of QoL)
    health = (
        (data.get('air_quality', 3) / 5.0) * 0.5 +
        (data.get('healthcare_access', 3) / 5.0) * 0.5
    )
    
    qol_score = (
        accessibility * 0.327 +
        safety * 0.218 +
        services * 0.145 +
        education * 0.127 +
        recreation * 0.127 +
        health * 0.055
    )
    
    # PILLAR 2: Economic Ability (20%)
    economic_score = 0
    economic_weight = 0.20
    
    # Real Estate VALUE (12% of total = 60% of Economic)
    land_price = data.get('land_price_per_cent_lakhs', 30)
    apt_price = data.get('apartment_price_per_sqft', 6000)
    
    # **FIX:** Don't just reward cheap - reward "sweet spot" value
    # Sweet spot for land: ₹10-25L/cent (too cheap = undeveloped, too expensive = unaffordable)
    # Sweet spot for apartments: ₹4000-7000/sqft
    
    # Land value score (bell curve around ₹15-20L)
    if land_price < 5:
        land_value = 0.3  # Too cheap = undeveloped
    elif land_price <= 15:
        land_value = 0.5 + (15 - land_price) / 15 * 0.3  # Getting better as it approaches 15
    elif land_price <= 25:
        land_value = 0.8  # Sweet spot!
    elif land_price <= 40:
        land_value = 0.8 - (land_price - 25) / 15 * 0.4  # Getting expensive
    else:
        land_value = 0.4 - (land_price - 40) / 40 * 0.2  # Very expensive
    
    # Apartment value score (bell curve around ₹5000-6500)
    if apt_price < 3000:
        apt_value = 0.4  # Too cheap = quality concerns
    elif apt_price <= 5500:
        apt_value = 0.6 + (5500 - apt_price) / 2500 * 0.3
    elif apt_price <= 7000:
        apt_value = 0.9  # Sweet spot!
    elif apt_price <= 9000:
        apt_value = 0.9 - (apt_price - 7000) / 2000 * 0.4
    else:
        apt_value = 0.5 - (apt_price - 9000) / 5000 * 0.3  # Very expensive
    
    # Combine
    real_estate_value = (land_value * 0.5 + apt_value * 0.5)
    
    # Job Access (8% of total = 40% of Economic) 
    job_access = (
        normalize(data.get('technopark_time', 35), 10, 60, invert=True) * 0.5 +
        normalize(data.get('city_centre_time', 20), 5, 45, invert=True) * 0.3 +
        (data.get('commercial_vibrancy', 3) / 5.0) * 0.2
    )
    
    economic_score = real_estate_value * 0.6 + job_access * 0.4
    
    # PILLAR 3: Sustainability & Character (25%)
    sustainability_score = 0
    sustainability_weight = 0.25
    
    # Environment (10% of total = 40% of Sustainability)
    environment = (
        (data.get('air_quality', 3) / 5.0) * 0.3 +
        ((5 - data.get('noise_level', 3)) / 5.0) * 0.3 +  # Invert noise
        (data.get('cleanliness', 3) / 5.0) * 0.2 +
        (data.get('green_cover', 3) / 5.0) * 0.2
    )
    
    # Urban Character (10% of total = 40% of Sustainability)
    character = (
        (data.get('urban_character', 3) / 5.0) * 0.3 +
        (data.get('prestige', 3) / 5.0) * 0.4 +
        (data.get('infrastructure_maturity', 3) / 5.0) * 0.3
    )
    
    # Future Potential (5% of total = 20% of Sustainability)
    future = (data.get('future_potential', 3) / 5.0)
    
    sustainability_score = environment * 0.4 + character * 0.4 + future * 0.2
    
    # OVERALL SCORE
    overall = (
        qol_score * qol_weight +
        economic_score * economic_weight +
        sustainability_score * sustainability_weight
    )
    
    # Scale to 10
    overall_10 = overall * 10
    
    return {
        'overall': round(overall_10, 2),
        'quality_of_life': round(qol_score * 10, 2),
        'economic_ability': round(economic_score * 10, 2),
        'sustainability': round(sustainability_score * 10, 2)
    }

def normalize(value, min_val, max_val, invert=False):
    """Normalize value to 0-1 range"""
    if value is None:
        return 0.5
    normalized = (value - min_val) / (max_val - min_val)
    normalized = max(0, min(1, normalized))
    return 1 - normalized if invert else normalized

def main():
    # Load data
    with open('data_collection/output/deduped_scores.json', 'r', encoding='utf-8') as f:
        localities = json.load(f)
    
    # Calculate scores
    print("\n" + "="*70)
    print("CALCULATING RANKINGS FOR 17 TRIVANDRUM LOCALITIES")
    print("="*70 + "\n")
    
    results = []
    for locality in localities:
        if locality.get('status') == 'success':
            scores = calculate_overall_score(locality)
            results.append({
                'name': locality['name'],
                'overall_score': scores['overall'],
                'qol_score': scores['quality_of_life'],
                'economic_score': scores['economic_ability'],
                'sustainability_score': scores['sustainability'],
                'land_price': locality.get('land_price_per_cent_lakhs', 0),
                'apartment_price': locality.get('apartment_price_per_sqft', 0),
                'data': locality  # Keep full data
            })
    
    # Sort by overall score
    results.sort(key=lambda x: x['overall_score'], reverse=True)
    
    # Display Top 10
    print("\n🏆 TRIVANDRUM TOP 10 LOCALITIES 🏆\n")
    print(f"{'Rank':<6} {'Locality':<25} {'Overall':<10} {'QoL':<8} {'Economic':<10} {'Sustain':<10}")
    print("-" * 70)
    
    for i, result in enumerate(results[:10], 1):
        emoji = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else "  "
        print(f"{emoji} #{i:<4} {result['name']:<25} {result['overall_score']:<10.2f} {result['qol_score']:<8.2f} {result['economic_score']:<10.2f} {result['sustainability_score']:<10.2f}")
    
    print("\n" + "-" * 70)
    print("\n📊 ALSO WORTH CONSIDERING (#11-17)\n")
    
    for i, result in enumerate(results[10:], 11):
        print(f"   #{i:<4} {result['name']:<25} {result['overall_score']:<10.2f}")
    
    # Save results
    output = {
        'top_10': results[:10],
        'all_rankings': results,
        'methodology': 'EoLI-based weighted scoring: QoL 55%, Economic 20%, Sustainability 25%'
    }
    
    with open('data_collection/output/rankings.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*70)
    print("✅ Rankings saved to: data_collection/output/rankings.json")
    print("="*70 + "\n")

if __name__ == '__main__':
    main()
