"""
Fetch Property Prices using Serper (Web Search) + Gemini (AI Extraction)
Gets land price per cent and apartment price per sq ft for each locality.
"""

import os
import sys
import json
import time
import requests
from dotenv import load_dotenv
import google.generativeai as genai

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

SERPER_API_KEY = os.getenv('SERPER_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

LOCALITIES = [
    "Sreekaryam", "Statue", "Kazhakuttom", "Enchakkal", "Pattom",
    "Kesavadasapuram", "PMG", "Sasthamangalam", "Jagathy", "Vellayambalam",
    "Kowdiar", "Peroorkada", "Ulloor", "Vazhuthacaud", "Medical College",
    "Kuravankonam", "Ambalamukku", "Poojapura", "Kovalam", "Varkala"
]

def search_property_prices(locality: str) -> dict:
    """Search for property prices using Serper API"""
    url = "https://google.serper.dev/search"
    
    # Search for land prices
    land_query = f"{locality} Trivandrum land price per cent 2024"
    apartment_query = f"{locality} Trivandrum apartment flat price per sq ft 2024"
    
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }
    
    results = {"land_snippets": [], "apartment_snippets": []}
    
    # Search land prices
    try:
        response = requests.post(url, headers=headers, json={"q": land_query, "num": 5})
        data = response.json()
        for item in data.get("organic", []):
            snippet = f"{item.get('title', '')} - {item.get('snippet', '')}"
            results["land_snippets"].append(snippet)
    except Exception as e:
        print(f"  Error searching land prices: {e}")
    
    time.sleep(0.5)  # Rate limiting
    
    # Search apartment prices
    try:
        response = requests.post(url, headers=headers, json={"q": apartment_query, "num": 5})
        data = response.json()
        for item in data.get("organic", []):
            snippet = f"{item.get('title', '')} - {item.get('snippet', '')}"
            results["apartment_snippets"].append(snippet)
    except Exception as e:
        print(f"  Error searching apartment prices: {e}")
    
    return results


def extract_prices_with_gemini(locality: str, search_results: dict) -> dict:
    """Use Gemini to extract structured price data from search results"""
    
    prompt = f"""
You are a real estate data extractor. Extract property prices for {locality}, Trivandrum, Kerala from these search results.

LAND PRICE SEARCH RESULTS:
{chr(10).join(search_results.get('land_snippets', ['No results']))}

APARTMENT PRICE SEARCH RESULTS:
{chr(10).join(search_results.get('apartment_snippets', ['No results']))}

Extract and return ONLY valid JSON (no markdown, no explanation):
{{
    "land_price_per_cent_lakhs": <number or null if not found>,
    "apartment_price_per_sqft": <number or null if not found>,
    "land_price_range": "<low-high in lakhs or null>",
    "apartment_price_range": "<low-high in rupees or null>",
    "confidence": "<high/medium/low>",
    "source_notes": "<brief note about data quality>"
}}

IMPORTANT:
- Land prices in Trivandrum typically range from 5-50 lakhs per cent depending on location
- All prices in "L" or "Lac" or "Lakh" means Lakhs (1 Lakh = 100,000)
- Return the AVERAGE if a range is given
- If prices seem unrealistic or from old data, set confidence to "low"
- Return ONLY the JSON object, nothing else
"""
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up response - sometimes Gemini wraps in markdown
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        return json.loads(text)
    except Exception as e:
        print(f"  Gemini extraction error: {e}")
        return {
            "land_price_per_cent_lakhs": None,
            "apartment_price_per_sqft": None,
            "land_price_range": None,
            "apartment_price_range": None,
            "confidence": "error",
            "source_notes": str(e)
        }


def main():
    print("\n" + "="*70)
    print("💰 PROPERTY PRICE COLLECTION")
    print("="*70)
    print("Using Serper (Web Search) + Gemini (AI Extraction)")
    
    if not SERPER_API_KEY:
        print("❌ ERROR: SERPER_API_KEY not found in .env")
        return
    
    if not GEMINI_API_KEY:
        print("❌ ERROR: GEMINI_API_KEY not found in .env")
        return
    
    all_prices = []
    
    for locality in LOCALITIES:
        print(f"\n📍 {locality}...")
        
        # Step 1: Search web for prices
        print("  🔍 Searching web...")
        search_results = search_property_prices(locality)
        
        # Step 2: Extract with Gemini
        print("  🤖 Extracting prices with AI...")
        prices = extract_prices_with_gemini(locality, search_results)
        prices["locality"] = locality
        
        print(f"    Land: {prices.get('land_price_per_cent_lakhs')} L/cent ({prices.get('confidence')})")
        print(f"    Apt:  ₹{prices.get('apartment_price_per_sqft')}/sqft")
        
        all_prices.append(prices)
        time.sleep(1)  # Rate limiting
    
    # Save results
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'property_prices.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "last_updated": "2024-12-10",
            "source": "Serper Web Search + Gemini Extraction",
            "prices": all_prices
        }, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*70)
    print(f"✅ Saved to: {output_file}")
    print("="*70)
    
    # Summary
    print("\n📊 SUMMARY:")
    for p in all_prices:
        land = p.get('land_price_per_cent_lakhs')
        apt = p.get('apartment_price_per_sqft')
        conf = p.get('confidence', '?')
        print(f"  {p['locality']:<20} | Land: {str(land) + ' L':>8} | Apt: ₹{str(apt):>6}/sqft | {conf}")


if __name__ == '__main__':
    main()
