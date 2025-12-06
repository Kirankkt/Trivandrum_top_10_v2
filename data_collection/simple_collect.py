"""
Simplified Data Collection - Manual + Gemini Hybrid Approach
Since Google Maps APIs need activation, we'll use a hybrid approach:
- You provide: Travel times (Google Maps manual lookup)
- We automate: Gemini AI analysis of web search results
"""

import os
import sys
from dotenv import load_dotenv
import json
from typing import Dict
import google.generativeai as genai

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

class SimpleCollector:
    def __init__(self):
        """Initialize Gemini AI"""
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.gemini_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def analyze_locality(self, locality_name: str, manual_data: Dict) -> Dict:
        """Use Gemini to generate scores based on locality knowledge"""
        
        prompt = f"""
You are an expert on Trivandrum, Kerala localities. Analyze {locality_name} and provide scores (1-5 scale, decimals allowed).

KNOWN DATA:
- Travel time to City Centre: {manual_data.get('city_centre_time', 'unknown')} minutes
- Travel time to Technopark: {manual_data.get('technopark_time', 'unknown')} minutes
- Travel time to Airport: {manual_data.get('airport_time', 'unknown')} minutes

Based on your knowledge of Trivandrum and {locality_name}, score the following (1-5 scale):

📍 **Accessibility** (how well-connected is it?)
🛡️ **Safety** (crime, lighting, women's safety)
🧹 **Cleanliness** (garbage collection, maintenance)
🏘️ **Urban Character** (infrastructure, modern buildings, prestige)
⭐ **Prestige** (is it an aspirational address?)
🔊 **Noise Level** (1=very noisy, 5=very quiet)
💧 **Flooding Risk** (1=severe flooding, 5=no issues)
🌬️ **Air Quality** (1=poor, 5=excellent)
🏫 **School Quality** (availability & reputation)
🏥 **Healthcare Access** (hospitals nearby)
🛒 **Shopping** (markets, malls, convenience)

Respond ONLY with valid JSON (no markdown, no code blocks):
{{
  "public_transport": X.X,
  "road_quality": X.X,
  "safety_score": X.X,
  "cleanliness": X.X,
  "urban_character": X.X,
  "prestige": X.X,
  "noise_level": X.X,
  "flooding_risk": X.X,
  "air_quality": X.X,
  "school_quality": X.X,
  "healthcare_access": X.X,
  "shopping_convenience": X.X,
  "reasoning": "Brief 2-3 sentence explanation of why you scored it this way"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Remove markdown code blocks if present
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()
            
            # Find JSON
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = text[start:end]
                scores = json.loads(json_str)
                print(f"✓ Gemini analysis complete for {locality_name}")
                print(f"  Reasoning: {scores.get('reasoning', 'N/A')[:100]}...")
                return scores
            else:
                print(f"❌ Could not find JSON in Gemini response")
                return {}
        except Exception as e:
            print(f"❌ Gemini analysis failed: {e}")
            return {}

def create_manual_template():
    """Create Excel-like template for manual data entry"""
    localities = [
        'Kowdiar', 'Pattom', 'Vazhuthacaud', 'Vellayambalam', 'PMG',
        'Statue', 'Kesavadasapuram', 'Jagathy', 'Ulloor',
        'Sasthamangalam', 'Enchakkal', 'Kazhakuttom', 
        'Thampanoor', 'Nemom', 'Kovalam'
    ]
    
    template = []
    for loc in localities:
        template.append({
            'locality': loc,
            'city_centre_time': 0,  # Fill manually (Google Maps)
            'technopark_time': 0,    # Fill manually
            'airport_time': 0,       # Fill manually
            'medical_college_time': 0,  # Fill manually
            'schools_count_3km': 0,  # Estimate or Google Maps count
            'hospitals_count_3km': 0,
            'restaurants_count_3km': 0,
            'land_price_per_cent_lakhs': 0,  # MagicBricks/99acres
            'apartment_price_per_sqft': 0,
            # AI will fill these after you provide above:
            'ai_scores': 'will be generated'
        })
    
    output_file = 'data_collection/manual_input_template.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(template, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Created manual template: {output_file}")
    print(f"\n📝 NEXT STEPS:")
    print(f"1. Open {output_file}")
    print(f"2. For each locality, use Google Maps to fill travel times")
    print(f"3. Use MagicBricks.com to get land/apartment prices")
    print(f"4. Estimate amenity counts (or count manually on Google Maps)")
    print(f"5. Save the file")
    print(f"6. Run: python data_collection/process_manual.py")

def process_manual_data(input_file: str):
    """Process manually-filled template with Gemini analysis"""
    print("\\n" + "="*60)
    print("PROCESSING MANUAL DATA WITH GEMINI AI")
    print("="*60)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    collector = SimpleCollector()
    results = []
    
    for item in data:
        locality = item['locality']
        print(f"\\n📍 Processing: {locality}")
        
        # Get AI scores
        ai_scores = collector.analyze_locality(locality, item)
        
        # Combine manual + AI data
        result = {
            **item,
            **ai_scores
        }
        del result['ai_scores']  # Remove placeholder
        
        results.append(result)
    
    # Save final results
    output_file = 'data_collection/output/final_locality_scores.json'
    os.makedirs('data_collection/output', exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\\n{'='*60}")
    print(f"✅ COMPLETE! Final scores saved to: {output_file}")
    print(f"{'='*60}")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'process':
        # Process manually-filled data
        process_manual_data('data_collection/manual_input_template.json')
    else:
        # Create template
        create_manual_template()
