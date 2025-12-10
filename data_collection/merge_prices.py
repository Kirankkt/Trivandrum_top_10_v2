"""
Merge property prices into objective rankings
"""

import os
import sys
import json

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load files
script_dir = os.path.dirname(__file__)
data_dir = os.path.join(script_dir, '..', 'data')

with open(os.path.join(data_dir, 'objective_rankings.json'), 'r', encoding='utf-8') as f:
    rankings = json.load(f)

with open(os.path.join(data_dir, 'property_prices.json'), 'r', encoding='utf-8') as f:
    prices_data = json.load(f)

# Create price lookup
price_lookup = {p['locality']: p for p in prices_data['prices']}

# Manual corrections for clearly wrong values
MANUAL_CORRECTIONS = {
    "Varkala": {"land_price_per_cent_lakhs": 8, "apartment_price_per_sqft": 4500},
    "Kuravankonam": {"land_price_per_cent_lakhs": 18, "apartment_price_per_sqft": 9107},
    "Kesavadasapuram": {"apartment_price_per_sqft": 7500},
    "Peroorkada": {"apartment_price_per_sqft": 5500},
    "Poojapura": {"apartment_price_per_sqft": 5800},
    "Pattom": {"apartment_price_per_sqft": 8500},
    # Fill missing land prices with estimates based on neighbors
    "Sreekaryam": {"land_price_per_cent_lakhs": 8},
    "Enchakkal": {"land_price_per_cent_lakhs": 25},
    "Vellayambalam": {"land_price_per_cent_lakhs": 25},
    "Ulloor": {"land_price_per_cent_lakhs": 10},
    "Medical College": {"land_price_per_cent_lakhs": 12},
    "Ambalamukku": {"land_price_per_cent_lakhs": 14},
}

# Merge prices into rankings
for item in rankings['rankings']:
    name = item['name']
    prices = price_lookup.get(name, {})
    
    # Get base values
    land_price = prices.get('land_price_per_cent_lakhs')
    apt_price = prices.get('apartment_price_per_sqft')
    
    # Apply manual corrections
    if name in MANUAL_CORRECTIONS:
        corrections = MANUAL_CORRECTIONS[name]
        if 'land_price_per_cent_lakhs' in corrections:
            land_price = corrections['land_price_per_cent_lakhs']
        if 'apartment_price_per_sqft' in corrections:
            apt_price = corrections['apartment_price_per_sqft']
    
    # Add to data
    item['land_price'] = land_price
    item['apartment_price'] = apt_price
    item['data']['land_price_per_cent_lakhs'] = land_price
    item['data']['apartment_price_per_sqft'] = apt_price

# Update metadata 
rankings['price_source'] = "Serper Web Search + Gemini Extraction + Manual Review"

# Save updated rankings
output_path = os.path.join(data_dir, 'objective_rankings.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(rankings, f, indent=2, ensure_ascii=False)

print("✅ Merged property prices into objective_rankings.json")
print("\n📊 Price Summary:")
for item in rankings['rankings']:
    land = item.get('land_price')
    apt = item.get('apartment_price')
    print(f"  {item['name']:<20} | Land: {str(land) + ' L':>8} | Apt: ₹{str(apt):>6}/sqft")
