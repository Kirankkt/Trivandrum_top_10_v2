"""
Trivandrum Top 10 - Data Collection Pipeline
Week 1: Automated locality data collection using APIs
"""

import os
import sys
from dotenv import load_dotenv
import json
import requests
import time
from typing import Dict, List
import google.generativeai as genai

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

class DataCollector:
    def __init__(self):
        """Initialize API clients"""
        self.google_maps_key = os.getenv('GOOGLE_MAPS_API_KEY')
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        self.serper_key = os.getenv('SERPER_API_KEY')
        
        # Configure Gemini - use correct model name
        genai.configure(api_key=self.gemini_key)
        self.gemini_model = genai.GenerativeModel('gemini-flash-latest')
        
        # Reference points for distance calculations
        self.reference_points = {
            'city_centre': '8.5241,76.9366',  # Palayam/Statue
            'technopark': '8.5599,76.8792',   # Technopark Phase 1
            'airport': '8.4821,76.9200',      # Trivandrum Airport
            'medical_college': '8.5261,76.9512'  # Medical College
        }
        
    def get_coordinates(self, locality_name: str) -> tuple:
        """Get lat, lng for a locality using geocoding"""
        url = 'https://maps.googleapis.com/maps/api/geocode/json'
        params = {
            'address': f'{locality_name}, Trivandrum, Kerala, India',
            'key': self.google_maps_key
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['status'] == 'OK':
            location = data['results'][0]['geometry']['location']
            return location['lat'], location['lng']
        else:
            print(f"❌ Geocoding failed for {locality_name}: {data['status']}")
            return None, None
    
    def get_travel_time(self, origin_lat: float, origin_lng: float, 
                        dest_name: str, dest_coords: str) -> int:
        """Get driving time in minutes using Distance Matrix API"""
        url = 'https://maps.googleapis.com/maps/api/distancematrix/json'
        params = {
            'origins': f'{origin_lat},{origin_lng}',
            'destinations': dest_coords,
            'mode': 'driving',
            'departure_time': 'now',  # Current traffic
            'key': self.google_maps_key
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['status'] == 'OK':
            element = data['rows'][0]['elements'][0]
            if element['status'] == 'OK':
                duration_mins = element['duration_in_traffic']['value'] // 60 if 'duration_in_traffic' in element else element['duration']['value'] // 60
                print(f"  ✓ {dest_name}: {duration_mins} min")
                return duration_mins
        
        print(f"  ❌ Failed to get time to {dest_name}")
        return None
    
    def fetch_amenities(self, lat: float, lng: float, amenity_type: str) -> List[Dict]:
        """Fetch nearby amenities details for deduplication"""
        url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
        
        # Map our types to Google Places types
        type_mapping = {
            'schools': 'school',
            'hospitals': 'hospital',
            'restaurants': 'restaurant',
            'cafes': 'cafe',
            'supermarkets': 'supermarket',
            'gyms': 'gym',
            'parks': 'park',
            'pharmacies': 'pharmacy',
            'police_stations': 'police',
            'fire_stations': 'fire_station'
        }
        
        params = {
            'location': f'{lat},{lng}',
            'radius': 1500,  # 1.5km radius
            'type': type_mapping.get(amenity_type, amenity_type),
            'key': self.google_maps_key
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        results = []
        if data['status'] == 'OK':
            for place in data['results']:
                results.append({
                    'place_id': place.get('place_id'),
                    'name': place.get('name'),
                    'lat': place['geometry']['location']['lat'],
                    'lng': place['geometry']['location']['lng'],
                    'rating': place.get('rating')
                })
            print(f"  ✓ {amenity_type}: {len(results)} found")
            return results
        
        if data['status'] == 'ZERO_RESULTS':
            print(f"  ✓ {amenity_type}: 0 found")
            return []
            
        print(f"  ❌ Failed to fetch {amenity_type}: {data.get('status')}")
        return []
    
    def get_reviews(self, locality_name: str, lat: float, lng: float) -> List[str]:
        """Get Google reviews for the locality area"""
        # Search for the locality itself as a place
        url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
        params = {
            'location': f'{lat},{lng}',
            'radius': 500,
            'key': self.google_maps_key
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        reviews = []
        if data['status'] == 'OK' and len(data['results']) > 0:
            # Get details for top 3 places to gather reviews
            for place in data['results'][:3]:
                place_id = place['place_id']
                details_url = 'https://maps.googleapis.com/maps/api/place/details/json'
                details_params = {
                    'place_id': place_id,
                    'fields': 'reviews',
                    'key': self.google_maps_key
                }
                
                details_response = requests.get(details_url, params=details_params)
                details_data = details_response.json()
                
                if 'result' in details_data and 'reviews' in details_data['result']:
                    for review in details_data['result']['reviews']:
                        reviews.append(review['text'])
        
        print(f"  ✓ Gathered {len(reviews)} reviews")
        return reviews
    
    def search_web(self, query: str) -> str:
        """Search web using Serper API"""
        url = 'https://google.serper.dev/search'
        headers = {
            'X-API-KEY': self.serper_key,
            'Content-Type': 'application/json'
        }
        payload = {
            'q': query,
            'num': 10  # Get more results for prices
        }
        
        response = requests.post(url, headers=headers, json=payload)
        data = response.json()
        
        # Compile results
        results = []
        if 'organic' in data:
            for item in data['organic'][:10]:
                results.append(f"{item['title']}: {item.get('snippet', '')}")
        
        return "\n".join(results)
    
    def get_real_estate_prices(self, locality_name: str) -> Dict:
        """Get property prices using Serper + Gemini"""
        print(f"\n7️⃣ Getting real estate prices...")
        
        # Search for land prices
        land_query = f"{locality_name} land price per cent Trivandrum site:magicbricks.com OR site:99acres.com"
        land_results = self.search_web(land_query)
        
        # Search for apartment prices  
        apt_query = f"{locality_name} apartment price per sqft Trivandrum site:magicbricks.com OR site:99acres.com"
        apt_results = self.search_web(apt_query)
        
        # Use Gemini to extract prices
        prompt = f"""
Extract real estate prices for {locality_name}, Trivandrum from these search results.

LAND PRICE SEARCH RESULTS:
{land_results}

APARTMENT PRICE SEARCH RESULTS:
{apt_results}

Extract and provide:
1. Median land price per cent (in lakhs ₹)
2. Median apartment price per sqft (in ₹)

If you find multiple listings, calculate the median/average.
If no clear data, estimate based on Trivandrum market knowledge and locality prestige.

Respond ONLY with valid JSON:
{{
  "land_price_per_cent_lakhs": XX,
  "apartment_price_per_sqft": XXXX,
  "confidence": "high/medium/low",
  "source": "brief explanation of where you got the data or how you estimated"
}}
"""
        
        try:
            response = self.gemini_model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean response
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()
            
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = text[start:end]
                prices = json.loads(json_str)
                print(f"  ✓ Land: ₹{prices.get('land_price_per_cent_lakhs', 0)}L/cent")
                print(f"  ✓ Apartment: ₹{prices.get('apartment_price_per_sqft', 0)}/sqft")
                print(f"  ✓ Confidence: {prices.get('confidence', 'unknown')}")
                return prices
            else:
                print(f"  ❌ Could not extract prices")
                return {}
        except Exception as e:
            print(f"  ❌ Price extraction failed: {e}")
            return {}
    
    def analyze_with_gemini(self, locality_name: str, reviews: List[str], 
                           web_results: str, collected_data: Dict) -> Dict:
        """Use Gemini with GUARDRAILS - only for subjective metrics, provide evidence"""
        
        # Extract collected data for context
        travel_times = f"City: {collected_data.get('city_centre_time')}min, Technopark: {collected_data.get('technopark_time')}min"
        amenity_summary = f"Schools: {collected_data.get('schools_count', 0)}, Hospitals: {collected_data.get('hospitals_count', 0)}, Parks: {collected_data.get('parks_count', 0)}, Police: {collected_data.get('police_stations_count', 0)}, Pharmacies: {collected_data.get('pharmacies_count', 0)}"
        
        prompt = f"""
You are a LOCAL EXPERT on Trivandrum. Analyze {locality_name} using ONLY verified data.

**ACTUAL COLLECTED DATA (use this as PRIMARY evidence):**
- Travel times: {travel_times}
- Amenities: {amenity_summary}
- Reviews: {len(reviews)} reviews collected
- Web search: Infrastructure & news data available

**REVIEWS (real user feedback):**
{chr(10).join(reviews[:10]) if reviews else "No reviews"}

**WEB SEARCH (news & infrastructure):**
{web_results[:400]}

**CRITICAL INSTRUCTIONS:**
1. Base scores on ACTUAL DATA above (counts, times, reviews)
2. If no data available, use your LOCAL KNOWLEDGE of Trivandrum
3. DO NOT guess or assume - mark confidence as "low" if uncertain
4. Provide SPECIFIC EVIDENCE for each score

Rate these 18 PERCEPTION metrics (1-5, 0.1 precision):

**ACCESSIBILITY (AI-assisted, we have counts):**
public_transport: Bus coverage (use: proximity to city/junctions)
road_quality: Road condition based on reviews/knowledge
proximity_junctions: Distance to Pattom/Ulloor junctions

**SAFETY (subjective):**
safety_score: Based on reviews + local knowledge
street_lighting: From reviews or local knowledge
women_safety: Perception from reviews/knowledge

**QUALITY PERCEPTION (use collected data + knowledge):**
healthcare_quality: Hospital quality (we have count={collected_data.get('hospitals_count', 0)})
school_reputation: School quality (we have count={collected_data.get('schools_count', 0)})

**SERVICES (hard to measure, use reviews):**
water_supply: 24/7 reliability from reviews/knowledge
waste_collection: Effectiveness from reviews
drainage: Monsoon sewerage from reviews/web

**ENVIRONMENT (subjective):**
air_quality: Pollution from traffic/location
noise_level: 1=very noisy, 5=quiet
flooding_risk: From drainage + web search
green_cover: Parks % (we have count={collected_data.get('parks_count', 0)})

**CHARACTER (perception):**
cleanliness: Overall upkeep from reviews
prestige: Aspirational value from knowledge
infrastructure_feel: Paved roads, sidewalks feel

**ECONOMIC (use data):**
commercial_activity: Offices/PSUs (use restaurant count={collected_data.get('restaurants_count', 0)} as proxy)
job_proximity: Access to jobs (use travel time={collected_data.get('technopark_time', 0)}min)

**FUTURE (from web search):**
smart_city_projects: From web search results above
developer_activity: New projects from web/knowledge

Respond with JSON:
{{
  "public_transport": X.X, "road_quality": X.X, "proximity_junctions": X.X,
  "safety_score": X.X, "street_lighting": X.X, "women_safety": X.X,
  "healthcare_quality": X.X, "school_reputation": X.X,
  "water_supply": X.X, "waste_collection": X.X, "drainage": X.X,
  "air_quality": X.X, "noise_level": X.X, "flooding_risk": X.X, "green_cover": X.X,
  "cleanliness": X.X, "prestige": X.X, "infrastructure_feel": X.X,
  "commercial_activity": X.X, "job_proximity": X.X,
  "smart_city_projects": X.X, "developer_activity": X.X,
  "confidence": "high/medium/low",
  "evidence": "List 3-5 specific data points you used: e.g. '20 hospitals, 4min to Med College, reviews mention good roads'"
}}
"""
        
        try:
            response = self.gemini_model.generate_content(prompt)
            text = response.text.strip()
            
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()
            
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = text[start:end]
                scores = json.loads(json_str)
                
                # Validate against hallucination
                if scores.get('confidence') == 'low':
                    print(f"  ⚠️  Low confidence: {scores.get('evidence', 'N/A')[:50]}")
                
                print(f"  ✓ Gemini: {len([k for k in scores if k not in ['confidence', 'evidence']])} metrics, confidence={scores.get('confidence', 'unknown')}")
                return scores
            else:
                print(f"  ❌ Could not parse JSON")
                return {}
        except Exception as e:
            print(f"  ❌ Gemini failed: {e}")
            return {}
        """Use Gemini to analyze reviews and generate ALL required scores"""
        
        prompt = f"""
You are an expert on Trivandrum, Kerala localities. Analyze {locality_name} comprehensively.

REVIEWS: {chr(10).join(reviews[:15]) if reviews else "Limited reviews"}
WEB RESULTS: {web_results[:500]}

Rate ALL 32 metrics below (1-5 scale, 0.1 precision) based on reviews, web data, AND your knowledge of Trivandrum:

**ACCESSIBILITY (6 metrics):**
public_transport: Bus routes, frequency, connectivity
road_quality: Road condition, potholes, maintenance  
proximity_junctions: Distance to Pattom/Ulloor/Statue junctions

**SAFETY (4 metrics):**
safety_score: Overall crime perception, safety feeling
street_lighting: Quality & coverage of street lights
women_safety: Specific safety perception for women
police_fire_proximity: Police & fire station access

**HEALTH (2 metrics):**
healthcare_access: Hospital quality & proximity
pharmacy_availability: Medical stores availability

**EDUCATION (2 metrics):**
school_quality: School reputation & results
coaching_centers: Tutorials, libraries availability

**SERVICES (4 metrics):**
water_supply: Reliability, 24/7 availability
waste_collection: Garbage removal effectiveness
drainage: Sewerage quality, monsoon preparedness
cleanliness: Overall area cleanliness

**RECREATION (2 metrics):**
parks_playgrounds: Availability & maintenance
recreation_facilities: Community halls, clubs

**ENVIRONMENT (4 metrics):**
air_quality: Pollution levels, freshness
noise_level: 1=very noisy, 5=very quiet
flooding_risk: 1=severe, 5=no issues
green_cover: Trees, parks, vegetation %

**URBAN CHARACTER (4 metrics):**
urban_character: Infrastructure, modern feel
prestige: Aspirational address value
infrastructure_maturity: Paved roads, sidewalks
architectural_quality: Building aesthetics

**ECONOMIC (2 metrics):**
commercial_vibrancy: Offices, businesses, PSUs
job_market_access: Proximity to job hubs

**FUTURE (2 metrics):**
infrastructure_pipeline: Smart City, announced projects  
developer_activity: New projects, investment

Respond ONLY with valid JSON (no markdown):
{{
  "public_transport": X.X, "road_quality": X.X, "proximity_junctions": X.X,
  "safety_score": X.X, "street_lighting": X.X, "women_safety": X.X, "police_fire_proximity": X.X,
  "healthcare_access": X.X, "pharmacy_availability": X.X,
  "school_quality": X.X, "coaching_centers": X.X,
  "water_supply": X.X, "waste_collection": X.X, "drainage": X.X, "cleanliness": X.X,
  "parks_playgrounds": X.X, "recreation_facilities": X.X,
  "air_quality": X.X, "noise_level": X.X, "flooding_risk": X.X, "green_cover": X.X,
  "urban_character": X.X, "prestige": X.X, "infrastructure_maturity": X.X, "architectural_quality": X.X,
  "commercial_vibrancy": X.X, "job_market_access": X.X,
  "infrastructure_pipeline": X.X, "developer_activity": X.X,
  "reasoning": "2-3 sentences explaining key scores"
}}
"""
        
        try:
            response = self.gemini_model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean response
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()
            
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = text[start:end]
                scores = json.loads(json_str)
                print(f"  ✓ Gemini: {len(scores)-1} metrics generated")
                return scores
            else:
                print(f"  ❌ Could not parse JSON")
                return {}
        except Exception as e:
            print(f"  ❌ Gemini failed: {e}")
            return {}
    
    def collect_locality_data(self, locality_name: str) -> Dict:
        """Main method to collect all data for a locality"""
        print(f"\n{'='*60}")
        print(f"📍 COLLECTING DATA FOR: {locality_name}")
        print(f"{'='*60}")
        
        data = {
            'name': locality_name,
            'status': 'pending'
        }
        
        # 1. Get coordinates
        print("\n1️⃣ Getting coordinates...")
        lat, lng = self.get_coordinates(locality_name)
        if not lat:
            data['status'] = 'failed'
            return data
        
        data['latitude'] = lat
        data['longitude'] = lng
        print(f"  ✓ Location: {lat}, {lng}")
        
        # 2. Get travel times
        print("\n2️⃣ Calculating travel times...")
        for dest_name, dest_coords in self.reference_points.items():
            time_mins = self.get_travel_time(lat, lng, dest_name, dest_coords)
            data[f'{dest_name}_time'] = time_mins
        
        # 3. Fetch amenities details (for deduplication)
        print("\n3️⃣ Fetching amenities...")
        amenity_types = [
            'schools', 'hospitals', 'restaurants', 'cafes', 
            'supermarkets', 'gyms', 'parks', 'pharmacies', 
            'police_stations', 'fire_stations'
        ]
        
        data['amenities'] = {}
        
        for amenity_name in amenity_types:
            # Get list of place details
            places = self.fetch_amenities(lat, lng, amenity_name)
            
            # Store full list for deduplication later
            data['amenities'][amenity_name] = places
            
            # Store immediate count (will be updated by deduplication later)
            data[f'{amenity_name}_count'] = len(places)
            
            time.sleep(0.5)  # Rate limiting
        
        # 4. Get reviews
        print("\n4️⃣ Gathering reviews...")
        reviews = self.get_reviews(locality_name, lat, lng)
        data['reviews_collected'] = len(reviews)
        
        # 5. Web search for additional context
        print("\n5️⃣ Searching web for context...")
        web_query = f"{locality_name} Trivandrum safety cleanliness flooding reviews"
        web_results = self.search_web(web_query)
        
        # 6. Get real estate prices
        price_data = self.get_real_estate_prices(locality_name)
        data.update(price_data)
        
        # 7. Gemini analysis (WITH COLLECTED DATA AS CONTEXT)
        print("\n6️⃣ Analyzing with Gemini AI...")
        gemini_scores = self.analyze_with_gemini(locality_name, reviews, web_results, data)
        data.update(gemini_scores)
        
        data['status'] = 'success'
        print(f"\n✅ DATA COLLECTION COMPLETE FOR {locality_name}")
        
        return data

def get_locality_category(locality_name: str, data: Dict) -> Dict:
    """Assign category tags to locality based on characteristics"""
    categories = []
    primary_category = ""
    
    # Define locality characteristics
    premium_tier = ['Kowdiar', 'Kuravankonam', 'Pattom', 'Vellayambalam', 'Vazhuthacaud']
    it_corridor = ['Kazhakuttom', 'Ulloor', 'Sreekaryam', 'St Andrews Trivandrum', 'Enchakkal']
    beach_tourism = ['Varkala', 'Kovalam', 'St Andrews Trivandrum']
    central_government = ['PMG', 'Statue', 'Kesavadasapuram', 'Palayam']
    healthcare_hub = ['Medical College', 'Kumarapuram']
    university_academic = ['Sreekaryam', 'Medical College']
    residential_family = ['Sasthamangalam', 'Peroorkada', 'Ambalamukku', 'Jagathy']
    
    # Assign categories
    if locality_name in premium_tier:
        categories.append('Premium')
        if not primary_category:
            primary_category = 'Premium Residential'
    
    if locality_name in it_corridor:
        categories.append('IT Corridor')
        if not primary_category:
            primary_category = 'IT Professional Hub'
    
    if locality_name in beach_tourism:
        categories.append('Beach Town')
        if not primary_category:
            primary_category = 'Coastal/Tourism'
    
    if locality_name in central_government:
        categories.append('City Center')
        if not primary_category:
            primary_category = 'Central/Government'
    
    if locality_name in healthcare_hub:
        categories.append('Healthcare Hub')
        if not primary_category:
            primary_category = 'Healthcare District'
    
    if locality_name in university_academic:
        categories.append('Academic')
        if not primary_category:
            primary_category = 'University Area'
    
    if locality_name in residential_family:
        categories.append('Family Friendly')
        if not primary_category:
            primary_category = 'Residential'
    
    # Data-driven categories
    if data.get('land_price_per_cent_lakhs', 0) > 15:
        if 'Premium' not in categories:
            categories.append('Upmarket')
    
    if data.get('technopark_time', 999) <= 15:
        if 'IT Corridor' not in categories:
            categories.append('Near Technopark')
    
    if data.get('city_centre_time', 999) <= 10:
        if 'City Center' not in categories:
            categories.append('Central Location')
    
    # Default if no category assigned
    if not primary_category:
        primary_category = 'Residential'
    
    if not categories:
        categories = ['Residential']
    
    return {
        'primary_category': primary_category,
        'tags': categories,
        'category_icon': get_category_icon(primary_category)
    }

def get_category_icon(primary_category: str) -> str:
    """Get emoji icon for category"""
    icons = {
        'Premium Residential': '👑',
        'IT Professional Hub': '💼',
        'Coastal/Tourism': '🏖️',
        'Central/Government': '🏛️',
        'Healthcare District': '🏥',
        'University Area': '🎓',
        'Residential': '🏘️'
    }
    return icons.get(primary_category, '🏘️')

def main():
    """Collect data for all 20 candidate localities"""
    collector = DataCollector()
    
    # List of localities to analyze (expanded to 20 based on AI research)
    localities = [
        # Premium Tier
        'Kowdiar',
        'Kuravankonam',  # NEW: Premium residential between Kowdiar-Pattom
        'Pattom',
        'Vellayambalam',
        'Vazhuthacaud',
        # Central/Government
        'PMG',
        'Statue',
        'Sasthamangalam',
        'Kesavadasapuram',
        # IT/Professional Corridor
        'Kazhakuttom',
        'Ulloor',
        'Sreekaryam',  # NEW: University/IT area
        'St Andrews Trivandrum',
        'Medical College',
        # Mid-Range Residential
        'Peroorkada',
        'Ambalamukku',  # NEW: Junction area with rising values
        'Jagathy',
        'Enchakkal',
        # Beach/Tourism
        'Varkala',
        'Kovalam'
    ]
    
    print(f"\n{'='*60}")
    print(f"COLLECTING DATA FOR {len(localities)} LOCALITIES")
    print(f"This will take approximately {len(localities) * 2} minutes")
    print(f"{'='*60}\n")
    
    results = []
    for i, locality in enumerate(localities, 1):
        print(f"\n[{i}/{len(localities)}] Processing: {locality}")
        try:
            data = collector.collect_locality_data(locality)
            
            # Add category information
            category_info = get_locality_category(locality, data)
            data.update(category_info)
            
            results.append(data)
            time.sleep(3)  # Rate limiting between localities
        except Exception as e:
            print(f"❌ ERROR collecting {locality}: {e}")
            results.append({
                'name': locality,
                'status': 'failed',
                'error': str(e)
            })
    
    # Save results
    output_file = 'data_collection/output/automated_scores.json'
    os.makedirs('data_collection/output', exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"\n{'='*60}")
    print(f"✅ ALL DONE! Results saved to: {output_file}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
