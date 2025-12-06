"""Test complete metrics collection for one locality"""
import sys
sys.path.append('data_collection')
from collect_data import DataCollector
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

collector = DataCollector()
print("Testing complete data collection for Kowdiar...\n")

# Collect data
data = collector.collect_locality_data('Kowdiar')

# Count metrics
print("\n" + "="*70)
print("METRICS COLLECTED:")
print("="*70)

automated_metrics = ['latitude', 'longitude', 'city_centre_time', 'technopark_time', 
                     'airport_time', 'medical_college_time', 'schools_count', 'hospitals_count',
                     'restaurants_count', 'cafes_count', 'supermarkets_count', 'gyms_count',
                     'reviews_collected', 'land_price_per_cent_lakhs', 'apartment_price_per_sqft']

ai_metrics = ['public_transport', 'road_quality', 'proximity_junctions',
              'safety_score', 'street_lighting', 'women_safety', 'police_fire_proximity',
              'healthcare_access', 'pharmacy_availability', 
              'school_quality', 'coaching_centers',
              'water_supply', 'waste_collection', 'drainage', 'cleanliness',
              'parks_playgrounds', 'recreation_facilities',
              'air_quality', 'noise_level', 'flooding_risk', 'green_cover',
              'urban_character', 'prestige', 'infrastructure_maturity', 'architectural_quality',
              'commercial_vibrancy', 'job_market_access',
              'infrastructure_pipeline', 'developer_activity']

print(f"\n✅ Automated Metrics: {sum(1 for m in automated_metrics if data.get(m) is not None)}/{len(automated_metrics)}")
for m in automated_metrics:
    if data.get(m) is not None:
        print(f"  ✓ {m}: {data.get(m)}")
    else:
        print(f"  ❌ {m}: MISSING")

print(f"\n✅ AI-Generated Metrics: {sum(1 for m in ai_metrics if data.get(m) is not None)}/{len(ai_metrics)}")
for m in ai_metrics:
    if data.get(m) is not None:
        print(f"  ✓ {m}: {data.get(m)}")
    else:
        print(f"  ❌ {m}: MISSING")

print(f"\n📊 TOTAL: {sum(1 for m in automated_metrics+ai_metrics if data.get(m) is not None)}/{len(automated_metrics)+len(ai_metrics)} metrics")

# Save test result
with open('test_complete_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved to: test_complete_data.json")
