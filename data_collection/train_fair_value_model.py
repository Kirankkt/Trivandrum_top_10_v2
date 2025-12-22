
import json
import os
import pandas as pd
import numpy as np
from sklearn.linear_model import LassoCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score

# Paths
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
LOCALITY_DATA_FILE = os.path.join(DATA_DIR, 'objective_locality_data.json')
PRICE_DATA_FILE = os.path.join(DATA_DIR, 'property_prices.json')

def load_data():
    with open(LOCALITY_DATA_FILE, 'r') as f:
        localities = json.load(f)
    with open(PRICE_DATA_FILE, 'r') as f:
        prices = json.load(f)['prices']
    return localities, prices

def prepare_dataset(localities, prices):
    # Convert to DataFrames
    df_loc = pd.DataFrame(localities)
    df_price = pd.DataFrame(prices)
    
    # Merge on locality name
    df = pd.merge(df_loc, df_price, left_on='name', right_on='locality')
    
    # Drop rows without target (land_price_per_cent_lakhs)
    df = df.dropna(subset=['land_price_per_cent_lakhs'])
    
    # FEATURE COMPRESSION: Group features into 4 Pillars
    
    # Pillar 1: Connectivity (Low time = High value)
    # We invert it: (60 - time) so higher number = better connectivity
    connectivity_features = [
        'city_centre_time', 'technopark_time', 'airport_time', 
        'medical_college_time', 'secretariat_time', 'ksrtc_stand_time'
    ]
    for col in connectivity_features:
        df[col] = df[col].fillna(60) # Assume 60 mins if missing
        
    df['Pillar_Connectivity'] = df[connectivity_features].apply(lambda x: 60 - x).mean(axis=1)
    
    # Pillar 2: Infrastructure (Counts of essential services)
    infra_features = ['school_count', 'hospital_count', 'police_count', 'fire_station_count']
    df['Pillar_Infrastructure'] = df[infra_features].fillna(0).sum(axis=1)
    
    # Pillar 3: Lifestyle (Vibe and amenities)
    lifestyle_features = ['park_count', 'restaurant_count', 'cafe_count', 'gym_count']
    df['Pillar_Lifestyle'] = df[lifestyle_features].fillna(0).sum(axis=1)
    
    # Pillar 4: Utility (Commercial density)
    utility_features = ['bank_count', 'atm_count', 'supermarket_count', 'pharmacy_count']
    df['Pillar_Utility'] = df[utility_features].fillna(0).sum(axis=1)
    
    # Target
    y = df['land_price_per_cent_lakhs'].astype(float)
    
    # Features
    X = df[['Pillar_Connectivity', 'Pillar_Infrastructure', 'Pillar_Lifestyle', 'Pillar_Utility']]
    
    return X, y, df

def train_model(X, y):
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # LassoCV (L1 Regularization with Cross Validation)
    # Leave-one-out is implicit if cv is set to n_samples
    model = LassoCV(cv=min(len(X)-1, 5), random_state=42)
    model.fit(X_scaled, y)
    
    # Predictions
    y_pred = model.predict(X_scaled)
    
    # Metrics
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    
    return model, scaler, y_pred, mae, r2

def main():
    print("--- Trivandrum Fair Value Predictor (ML PoC) ---")
    
    localities, prices = load_data()
    X, y, df = prepare_dataset(localities, prices)
    
    if len(df) < 5:
        print(f"Error: Not enough data points with actual prices. Found: {len(df)}")
        return
        
    print(f"Training on {len(df)} localities with 4 aggregated pillars...")
    
    model, scaler, y_pred, mae, r2 = train_model(X, y)
    
    print(f"Model Accuracy (R²): {r2:.2f}")
    print(f"Mean Absolute Error: {mae:.2f} Lakhs/cent")
    
    # Feature Importance (Weights)
    print("\nFeature Importance (Learned Pillars):")
    importance = pd.DataFrame({
        'Pillar': X.columns,
        'Weight': model.coef_
    }).sort_values(by='Weight', ascending=False)
    print(importance)
    
    # Locality Analysis
    df['Predicted_Price'] = y_pred
    df['Price_Diff'] = df['land_price_per_cent_lakhs'] - df['Predicted_Price']
    
    print("\n--- Locality Analysis ---")
    analysis = df[['name', 'land_price_per_cent_lakhs', 'Predicted_Price', 'Price_Diff']]
    analysis = analysis.rename(columns={'land_price_per_cent_lakhs': 'Actual'})
    
    # Sorted by Price_Diff to show Hidden Gems vs Prestige
    print("\nTop 'Hidden Gems' (Actual < Predicted):")
    print(analysis.sort_values(by='Price_Diff').head(5))
    
    print("\nTop 'Prestige Primums' (Actual > Predicted):")
    print(analysis.sort_values(by='Price_Diff', ascending=False).head(5))
    
    # Save results for the app to use
    output = {
        "model_stats": {
            "r2": r2,
            "mae": mae,
            "samples": len(df)
        },
        "feature_importance": importance.to_dict(orient='records'),
        "localities": analysis.to_dict(orient='records')
    }
    
    with open(os.path.join(DATA_DIR, 'ml_fair_value_results.json'), 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nResults saved to data/ml_fair_value_results.json")

if __name__ == "__main__":
    main()
