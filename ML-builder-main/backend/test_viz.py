#!/usr/bin/env python3
"""
Test the visualization service with sample data
"""

import requests
import json

# Test ML results visualization
ml_data = {
    "type": "ml_results",
    "data": {
        "algorithm": "Linear Regression",
        "rSquared": 0.8234,
        "predictions": [250000, 320000, 180000, 450000, 230000],
        "actualValues": [245000, 315000, 185000, 440000, 235000],
        "performance": {
            "r2Score": 0.8234,
            "meanSquaredError": 1234567
        }
    }
}

try:
    print("🧪 Testing Python Visualization Service...")
    response = requests.post('http://localhost:5000/api/visualize', json=ml_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Success! Generated {len(result['charts'])} charts")
        for i, chart in enumerate(result['charts']):
            print(f"   Chart {i+1}: {chart['title']} ({chart['type']})")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        
except Exception as e:
    print(f"❌ Connection error: {e}")
    print("Make sure the visualization service is running on port 5000")
