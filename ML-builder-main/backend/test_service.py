#!/usr/bin/env python3
"""
Simple test service to verify Python setup
"""

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'test'})

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Python service is working!'})

if __name__ == '__main__':
    print("🧪 Starting Test Service...")
    print("📍 Available at: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
