"""
Social Media Content Generator
Generates platform-specific posts based on trending localities from Supabase.

Usage:
    python social_media/generate_posts.py
"""

import os
import json
from datetime import datetime, timedelta

# Try to load from .env if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Try to use supabase-py if available, otherwise use requests
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    import urllib.request
    import urllib.parse

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://jhygaazqujzufiklqaah.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWdhYXpxdWp6dWZpa2xxYWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzEyMTksImV4cCI6MjA4MDYwNzIxOX0.rR_FePTK4iHQyjVSVokPX6LsKpZY-mFI0KEkfdX1Jno')
SITE_URL = 'trivandrumtop10.netlify.app'

# Path to rankings data
RANKINGS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'rankings.json')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'social_posts')


def get_trending_from_supabase(days=7, limit=3):
    """Fetch trending localities from Supabase."""
    one_week_ago = (datetime.utcnow() - timedelta(days=days)).isoformat()
    
    if SUPABASE_AVAILABLE:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        response = supabase.table('locality_views').select('locality_name').gte('viewed_at', one_week_ago).execute()
        data = response.data
    else:
        # Fallback: Use REST API directly
        url = f"{SUPABASE_URL}/rest/v1/locality_views?select=locality_name&viewed_at=gte.{one_week_ago}"
        req = urllib.request.Request(url, headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        })
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
    
    # Count occurrences
    counts = {}
    for row in data:
        name = row['locality_name']
        counts[name] = counts.get(name, 0) + 1
    
    # Sort and return top N
    sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    return sorted_items  # List of (name, count) tuples


def load_rankings():
    """Load rankings data."""
    with open(RANKINGS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_locality_data(rankings, locality_name):
    """Get data for a specific locality."""
    all_localities = rankings.get('all_rankings', rankings.get('top_10', []))
    for loc in all_localities:
        if loc.get('name') == locality_name:
            return loc
    return None


def generate_linkedin_post(locality, views, rank=None):
    """Generate LinkedIn-style professional post."""
    name = locality['name']
    data = locality.get('data', {})
    
    land_price = data.get('land_price_per_cent_lakhs', locality.get('land_price', 'N/A'))
    tech_time = data.get('technopark_time', 'N/A')
    qol_score = locality.get('qol_score', 'N/A')
    
    post = f"""🔥 This week's most-viewed locality in Trivandrum: {name}

Our data shows why people are interested in this area:
✅ {tech_time} min to Technopark
✅ Land: ₹{land_price}L/cent
✅ Quality of Life Score: {qol_score}/10

{views} people viewed this locality this week on our platform.

See the full data-driven rankings: {SITE_URL}

#Trivandrum #RealEstate #Kerala #NRI #Technopark #KeralaRealEstate"""
    
    return post


def generate_instagram_post(locality, views, rank=None):
    """Generate Instagram-style post with hashtags."""
    name = locality['name']
    data = locality.get('data', {})
    
    land_price = data.get('land_price_per_cent_lakhs', locality.get('land_price', 'N/A'))
    apt_price = data.get('apartment_price_per_sqft', locality.get('apartment_price', 'N/A'))
    category = data.get('primary_category', 'Residential')
    tags = data.get('tags', [])
    
    tag_str = ', '.join(tags[:2]) if tags else category
    
    post = f"""🏆 #1 Trending This Week: {name} 🔥

🏠 Land: ₹{land_price}L/cent
🏢 Apt: ₹{apt_price}/sqft
⭐ Why: {tag_str}

{views} views this week! Link in bio! 👆

#TrivandrumRealEstate #KeralaHomes #NRIIndia #PropertyInKerala #{name.replace(' ', '')} #TrivandrumTop10"""
    
    return post


def generate_facebook_post(locality, views, rank=None):
    """Generate Facebook-style conversational post."""
    name = locality['name']
    data = locality.get('data', {})
    
    land_price = data.get('land_price_per_cent_lakhs', locality.get('land_price', 'N/A'))
    tech_time = data.get('technopark_time', 'N/A')
    category = data.get('primary_category', 'Residential')
    
    post = f"""Looking for the best locality in Trivandrum? 🤔

Our users are loving {name} this week!

📍 Just {tech_time} min from Technopark
📍 Land prices around ₹{land_price}L/cent
📍 Category: {category}

{views} people checked it out this week!

👉 See the full Top 10: {SITE_URL}

What's YOUR favorite area in Trivandrum? Drop a comment! 👇"""
    
    return post


def main():
    # Fix Windows console encoding
    import sys
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')
    
    print("=" * 60)
    print("[SOCIAL MEDIA CONTENT GENERATOR]")
    print("=" * 60)
    print()
    
    # Get trending localities
    print("🔍 Fetching trending localities from Supabase...")
    try:
        trending = get_trending_from_supabase(days=7, limit=3)
    except Exception as e:
        print(f"⚠️ Could not fetch from Supabase: {e}")
        print("Using fallback data...")
        trending = [("Sreekaryam", 5), ("Pattom", 3), ("Kowdiar", 2)]
    
    if not trending:
        print("⚠️ No trending data found. Using sample data...")
        trending = [("Sreekaryam", 1)]
    
    print(f"✅ Found {len(trending)} trending localities")
    print()
    
    # Load rankings
    print("📊 Loading rankings data...")
    rankings = load_rankings()
    print("✅ Rankings loaded")
    print()
    
    # Generate posts for the #1 trending locality
    top_locality_name, top_views = trending[0]
    locality = get_locality_data(rankings, top_locality_name)
    
    if not locality:
        print(f"❌ Could not find data for {top_locality_name}")
        return
    
    print(f"🏆 Top Trending: {top_locality_name} ({top_views} views)")
    print()
    
    # Generate all posts
    output = []
    
    output.append("=" * 60)
    output.append(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    output.append(f"🏆 Trending Locality: {top_locality_name} ({top_views} views)")
    output.append("=" * 60)
    output.append("")
    
    # LinkedIn
    output.append("━" * 60)
    output.append("📌 LINKEDIN POST")
    output.append("━" * 60)
    linkedin_post = generate_linkedin_post(locality, top_views)
    output.append(linkedin_post)
    output.append("")
    
    # Instagram
    output.append("━" * 60)
    output.append("📸 INSTAGRAM POST")
    output.append("━" * 60)
    instagram_post = generate_instagram_post(locality, top_views)
    output.append(instagram_post)
    output.append("")
    
    # Facebook
    output.append("━" * 60)
    output.append("📘 FACEBOOK POST")
    output.append("━" * 60)
    facebook_post = generate_facebook_post(locality, top_views)
    output.append(facebook_post)
    output.append("")
    
    output.append("=" * 60)
    output.append("✅ Copy the posts above and paste into your social media!")
    output.append("=" * 60)
    
    # Print to console
    full_output = '\n'.join(output)
    print(full_output)
    
    # Save to file
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = os.path.join(OUTPUT_DIR, 'latest_posts.txt')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(full_output)
    
    print()
    print(f"💾 Also saved to: {output_file}")


if __name__ == '__main__':
    main()
