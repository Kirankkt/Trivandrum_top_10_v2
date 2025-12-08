"""Fix incorrect locality categories in rankings.json"""
import json
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load rankings
with open('data/rankings.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Category changes to apply
CHANGES = {
    'Enchakkal': {
        'primary_category': 'Transit/Residential',
        'tags': ['Transit Hub', 'Central'],
        'category_icon': '🚉'
    },
    'Ulloor': {
        'primary_category': 'Central Residential', 
        'tags': ['Central Location', 'Family Friendly'],
        'category_icon': '🏘️'
    }
}

def update_categories(localities_list):
    """Update categories in a list of localities"""
    updated = 0
    for loc in localities_list:
        name = loc.get('name')
        if name in CHANGES and 'data' in loc:
            for key, value in CHANGES[name].items():
                old_value = loc['data'].get(key)
                loc['data'][key] = value
                print(f"✅ {name}: {key} = '{old_value}' → '{value}'")
            updated += 1
    return updated

# Update both top_10 and all_rankings
count = 0
if 'top_10' in data:
    count += update_categories(data['top_10'])
if 'all_rankings' in data:
    count += update_categories(data['all_rankings'])

# Save
with open('data/rankings.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n📊 Updated {count} locality entries")
print("✅ Changes saved to data/rankings.json")
