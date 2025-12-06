"""
Show detailed score breakdown for one locality
"""
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load data
with open('data_collection/output/automated_scores.json', 'r', encoding='utf-8') as f:
    localities = json.load(f)

# Pick Kowdiar as example
kowdiar = [l for l in localities if l['name'] == 'Kowdiar'][0]

print("\n" + "="*80)
print("DETAILED SCORE BREAKDOWN - KOWDIAR")
print("="*80)

print("\n📍 LOCATION DATA:")
print(f"  Coordinates: {kowdiar['latitude']}, {kowdiar['longitude']}")

print("\n" + "="*80)
print("PILLAR 1: QUALITY OF LIFE (Weight: 55%)")
print("="*80)

print("\n🚗 A. ACCESSIBILITY & CONNECTIVITY (18% of total)")
print("-" * 80)
print(f"  Travel time to City Centre:    {kowdiar.get('city_centre_time', 'N/A')} min")
print(f"  Travel time to Technopark:     {kowdiar.get('technopark_time', 'N/A')} min")
print(f"  Travel time to Airport:        {kowdiar.get('airport_time', 'N/A')} min")
print(f"  Travel time to Medical College:{kowdiar.get('medical_college_time', 'N/A')} min")
print(f"  Public Transport Score:        {kowdiar.get('public_transport', 'N/A')}/5")
print(f"  Road Quality:                  {kowdiar.get('road_quality', 'N/A')}/5")

print("\n🛡️ B. SAFETY & SECURITY (12% of total)")
print("-" * 80)
print(f"  Overall Safety Score:          {kowdiar.get('safety_score', 'N/A')}/5")
print(f"  Street Lighting:               {kowdiar.get('street_lighting', 'N/A')}/5")
print(f"  Women's Safety:                {kowdiar.get('women_safety', 'N/A')}/5")

print("\n🏥 C. HEALTH (7% of total)")
print("-" * 80)
print(f"  Hospitals Count (3km):         {kowdiar.get('hospitals_count', 'N/A')}")
print(f"  Healthcare Access Score:       {kowdiar.get('healthcare_access', 'N/A')}/5")
print(f"  Air Quality:                   {kowdiar.get('air_quality', 'N/A')}/5")

print("\n🏫 D. EDUCATION (7% of total)")
print("-" * 80)
print(f"  Schools Count (3km):           {kowdiar.get('schools_count', 'N/A')}")
print(f"  School Quality Score:          {kowdiar.get('school_quality', 'N/A')}/5")

print("\n🚰 E. BASIC SERVICES (6% of total)")
print("-" * 80)
print(f"  Water Supply:                  {kowdiar.get('water_supply', 'N/A')}/5")
print(f"  Waste Collection:              {kowdiar.get('waste_collection', 'N/A')}/5")
print(f"  Flooding Risk:                 {kowdiar.get('flooding_risk', 'N/A')}/5 (lower=worse)")
print(f"  Cleanliness:                   {kowdiar.get('cleanliness', 'N/A')}/5")

print("\n🎾 F. RECREATION & LIFESTYLE (5% of total)")
print("-" * 80)
print(f"  Restaurants Count:             {kowdiar.get('restaurants_count', 'N/A')}")
print(f"  Cafes Count:                   {kowdiar.get('cafes_count', 'N/A')}")
print(f"  Supermarkets Count:            {kowdiar.get('supermarkets_count', 'N/A')}")
print(f"  Gyms Count:                    {kowdiar.get('gyms_count', 'N/A')}")

print("\n" + "="*80)
print("PILLAR 2: ECONOMIC ABILITY (Weight: 20%)")
print("="*80)

print("\n💰 A. REAL ESTATE (12% of total)")
print("-" * 80)
print(f"  Land Price per Cent:           ₹{kowdiar.get('land_price_per_cent_lakhs', 'N/A')}L")
print(f"  Apartment Price per Sqft:      ₹{kowdiar.get('apartment_price_per_sqft', 'N/A')}")
print(f"  Price Confidence:              {kowdiar.get('confidence', 'N/A')}")
print(f"  Data Source:                   {kowdiar.get('source', 'N/A')[:60]}...")

print("\n💼 B. ECONOMIC OPPORTUNITY (8% of total)")
print("-" * 80)
print(f"  Job Hub Proximity:             Based on Technopark ({kowdiar.get('technopark_time', 'N/A')} min)")
print(f"  Commercial Vibrancy:           {kowdiar.get('commercial_vibrancy', 'N/A')}/5")
print(f"  Retail Activity:               Based on amenity counts")

print("\n" + "="*80)
print("PILLAR 3: SUSTAINABILITY & CHARACTER (Weight: 25%)")
print("="*80)

print("\n🌳 A. ENVIRONMENT (10% of total)")
print("-" * 80)
print(f"  Air Quality:                   {kowdiar.get('air_quality', 'N/A')}/5")
print(f"  Noise Level:                   {kowdiar.get('noise_level', 'N/A')}/5 (lower=noisier)")
print(f"  Cleanliness:                   {kowdiar.get('cleanliness', 'N/A')}/5")
print(f"  Green Cover:                   {kowdiar.get('green_cover', 'N/A')}/5")

print("\n🏘️ B. URBAN CHARACTER (10% of total)")
print("-" * 80)
print(f"  Urban Character Score:         {kowdiar.get('urban_character', 'N/A')}/5")
print(f"  Prestige Factor:               {kowdiar.get('prestige', 'N/A')}/5")
print(f"  Infrastructure Maturity:       {kowdiar.get('infrastructure_maturity', 'N/A')}/5")

print("\n🚀 C. FUTURE POTENTIAL (5% of total)")
print("-" * 80)
print(f"  Development Projects:          {kowdiar.get('future_potential', 'N/A')}/5")
print(f"  Developer Interest:            {kowdiar.get('developer_interest', 'N/A')}/5")

print("\n" + "="*80)
print("AI REASONING")
print("="*80)
reasoning = kowdiar.get('reasoning', 'N/A')
print(f"\n{reasoning}\n")

print("="*80)
