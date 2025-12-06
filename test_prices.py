"""Quick test of real estate price extraction"""
import os
import sys
from dotenv import load_dotenv
sys.path.append('data_collection')
from collect_data import DataCollector

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

collector = DataCollector()
prices = collector.get_real_estate_prices('Kowdiar')

print("\n" + "="*60)
print("RESULT:")
print(prices)
print("="*60)
