"""Extract locality categories from rankings.json"""
import json
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/rankings.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get all localities
locs = data.get('all_rankings', data.get('top_10', []))

print("=" * 70)
print("CURRENT LOCALITY CATEGORIES")
print("=" * 70)

for i, loc in enumerate(locs[:20], 1):
    name = loc.get('name', 'Unknown')
    loc_data = loc.get('data', {})
    category = loc_data.get('primary_category', 'N/A')
    tags = loc_data.get('tags', [])
    icon = loc_data.get('category_icon', '')
    technopark_time = loc_data.get('technopark_time', 'N/A')
    city_time = loc_data.get('city_centre_time', 'N/A')
    
    print(f"{i:2}. {name:20} | {icon} {category:25} | Tags: {tags}")
    print(f"    Technopark: {technopark_time} min | City: {city_time} min")
    print()
