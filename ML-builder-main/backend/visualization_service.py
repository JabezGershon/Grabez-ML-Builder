#!/usr/bin/env python3
"""
Visualization Service for ML Pipeline
Generates charts and visualizations using Python libraries
"""

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Set style for better looking plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

def create_base64_plot(fig):
    """Convert matplotlib figure to base64 string"""
    img_buffer = io.BytesIO()
    fig.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
    img_buffer.seek(0)
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    plt.close(fig)
    return f"data:image/png;base64,{img_base64}"

@app.route('/api/visualize', methods=['POST'])
def create_visualization():
    """Main endpoint for creating visualizations"""
    try:
        data = request.json
        viz_type = data.get('type', 'auto')
        input_data = data.get('data', {})
        
        print(f"📊 Creating visualization: {viz_type}")
        print(f"📊 Input data keys: {list(input_data.keys())}")
        
        # Determine visualization type based on data
        if viz_type == 'auto':
            viz_type = determine_viz_type(input_data)
        
        # Generate appropriate visualization
        if viz_type == 'ml_results':
            charts = create_ml_visualizations(input_data)
        elif viz_type == 'dataset':
            charts = create_dataset_visualizations(input_data)
        elif viz_type == 'scatter':
            charts = create_scatter_plot(input_data)
        elif viz_type == 'histogram':
            charts = create_histogram(input_data)
        else:
            charts = [{'type': 'error', 'message': f'Unknown visualization type: {viz_type}'}]
        
        return jsonify({
            'success': True,
            'charts': charts,
            'type': viz_type
        })
        
    except Exception as e:
        print(f"❌ Visualization error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def determine_viz_type(data):
    """Automatically determine the best visualization type"""
    if 'algorithm' in data or 'rSquared' in data or 'accuracy' in data:
        return 'ml_results'
    elif 'headers' in data and 'data' in data:
        return 'dataset'
    elif 'predictions' in data and 'actualValues' in data:
        return 'scatter'
    else:
        return 'dataset'

def create_ml_visualizations(data):
    """Create visualizations for ML results"""
    charts = []
    
    try:
        # Performance Metrics Chart
        if any(key in data for key in ['rSquared', 'accuracy', 'performance']):
            fig = create_performance_metrics(data)
            if fig:
                charts.append({
                    'type': 'performance_metrics',
                    'title': f'{data.get("algorithm", "ML Model")} Performance',
                    'image': create_base64_plot(fig)
                })
        
        # Predictions vs Actual Scatter Plot
        if 'predictions' in data and 'actualValues' in data:
            fig = create_predictions_scatter(data)
            if fig:
                charts.append({
                    'type': 'predictions_scatter',
                    'title': 'Predictions vs Actual Values',
                    'image': create_base64_plot(fig)
                })
        
        # Feature Importance (if available)
        if 'featureImportance' in data:
            fig = create_feature_importance(data)
            if fig:
                charts.append({
                    'type': 'feature_importance',
                    'title': 'Feature Importance',
                    'image': create_base64_plot(fig)
                })
                
    except Exception as e:
        print(f"❌ Error creating ML visualizations: {e}")
        charts.append({'type': 'error', 'message': str(e)})
    
    return charts

def create_performance_metrics(data):
    """Create a performance metrics bar chart"""
    metrics = {}
    
    # Collect available metrics
    if 'rSquared' in data:
        metrics['R² Score'] = data['rSquared']
    if 'accuracy' in data:
        metrics['Accuracy'] = data['accuracy']
    if 'performance' in data:
        perf = data['performance']
        if 'r2Score' in perf:
            metrics['R² Score'] = perf['r2Score']
        if 'accuracy' in perf:
            metrics['Accuracy'] = perf['accuracy']
        if 'meanSquaredError' in perf:
            metrics['MSE'] = perf['meanSquaredError']
    
    if not metrics:
        return None
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    metric_names = list(metrics.keys())
    metric_values = list(metrics.values())
    
    # Create color map based on values
    colors = ['#10b981' if v > 0.7 else '#f59e0b' if v > 0.4 else '#ef4444' for v in metric_values]
    
    bars = ax.bar(metric_names, metric_values, color=colors, alpha=0.8)
    
    # Add value labels on bars
    for bar, value in zip(bars, metric_values):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                f'{value:.4f}', ha='center', va='bottom', fontweight='bold')
    
    ax.set_ylabel('Score')
    ax.set_title('Model Performance Metrics', fontsize=14, fontweight='bold')
    ax.set_ylim(0, max(1.1, max(metric_values) * 1.1))
    
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    return fig

def create_predictions_scatter(data):
    """Create predictions vs actual scatter plot"""
    predictions = data['predictions']
    actual_values = data['actualValues']
    
    if len(predictions) != len(actual_values):
        return None
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Create scatter plot
    ax.scatter(actual_values, predictions, alpha=0.6, s=50, color='#3b82f6')
    
    # Add perfect prediction line
    min_val = min(min(actual_values), min(predictions))
    max_val = max(max(actual_values), max(predictions))
    ax.plot([min_val, max_val], [min_val, max_val], 'r--', alpha=0.8, linewidth=2, label='Perfect Prediction')
    
    ax.set_xlabel('Actual Values')
    ax.set_ylabel('Predicted Values')
    ax.set_title('Predictions vs Actual Values', fontsize=14, fontweight='bold')
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    # Add R² score if available
    if 'rSquared' in data:
        ax.text(0.05, 0.95, f'R² = {data["rSquared"]:.4f}', 
                transform=ax.transAxes, fontsize=12, 
                bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8))
    
    plt.tight_layout()
    return fig

def create_feature_importance(data):
    """Create feature importance bar chart"""
    importance_data = data['featureImportance']
    
    if not importance_data:
        return None
    
    features = list(importance_data.keys())
    importances = list(importance_data.values())
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    bars = ax.barh(features, importances, color='#3b82f6', alpha=0.8)
    
    # Add value labels
    for bar, importance in zip(bars, importances):
        width = bar.get_width()
        ax.text(width + 0.01, bar.get_y() + bar.get_height()/2.,
                f'{importance:.3f}', ha='left', va='center', fontweight='bold')
    
    ax.set_xlabel('Importance')
    ax.set_title('Feature Importance', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3, axis='x')
    
    plt.tight_layout()
    return fig

def create_dataset_visualizations(data):
    """Create visualizations for dataset"""
    charts = []
    
    try:
        if 'headers' in data and 'data' in data:
            df = pd.DataFrame(data['data'])
            
            # Dataset summary
            charts.append(create_dataset_summary(df, data.get('fileName', 'Dataset')))
            
            # Histograms for numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols[:3]:  # Limit to first 3 numeric columns
                fig = create_column_histogram(df, col)
                if fig:
                    charts.append({
                        'type': 'histogram',
                        'title': f'Distribution of {col}',
                        'image': create_base64_plot(fig)
                    })
            
            # Correlation heatmap if multiple numeric columns
            if len(numeric_cols) > 1:
                fig = create_correlation_heatmap(df[numeric_cols])
                if fig:
                    charts.append({
                        'type': 'correlation',
                        'title': 'Feature Correlation Matrix',
                        'image': create_base64_plot(fig)
                    })
                    
    except Exception as e:
        print(f"❌ Error creating dataset visualizations: {e}")
        charts.append({'type': 'error', 'message': str(e)})
    
    return charts

def create_dataset_summary(df, filename):
    """Create dataset summary visualization"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 8))
    
    # Basic stats
    ax1.text(0.1, 0.8, f'Dataset: {filename}', fontsize=14, fontweight='bold')
    ax1.text(0.1, 0.6, f'Rows: {len(df):,}', fontsize=12)
    ax1.text(0.1, 0.4, f'Columns: {len(df.columns)}', fontsize=12)
    ax1.text(0.1, 0.2, f'Memory: {df.memory_usage(deep=True).sum() / 1024:.1f} KB', fontsize=12)
    ax1.set_xlim(0, 1)
    ax1.set_ylim(0, 1)
    ax1.axis('off')
    ax1.set_title('Dataset Overview')
    
    # Data types
    dtype_counts = df.dtypes.value_counts()
    ax2.pie(dtype_counts.values, labels=dtype_counts.index, autopct='%1.1f%%')
    ax2.set_title('Data Types Distribution')
    
    # Missing values
    missing = df.isnull().sum()
    if missing.sum() > 0:
        missing = missing[missing > 0]
        ax3.bar(range(len(missing)), missing.values)
        ax3.set_xticks(range(len(missing)))
        ax3.set_xticklabels(missing.index, rotation=45)
        ax3.set_title('Missing Values by Column')
        ax3.set_ylabel('Count')
    else:
        ax3.text(0.5, 0.5, 'No Missing Values', ha='center', va='center', fontsize=14)
        ax3.set_xlim(0, 1)
        ax3.set_ylim(0, 1)
        ax3.axis('off')
        ax3.set_title('Missing Values')
    
    # Numeric columns summary
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        stats_text = "Numeric Columns:\n"
        for col in numeric_cols[:5]:  # Show first 5
            mean_val = df[col].mean()
            stats_text += f"{col}: μ={mean_val:.2f}\n"
        ax4.text(0.1, 0.9, stats_text, fontsize=10, verticalalignment='top')
    else:
        ax4.text(0.5, 0.5, 'No Numeric Columns', ha='center', va='center', fontsize=14)
    
    ax4.set_xlim(0, 1)
    ax4.set_ylim(0, 1)
    ax4.axis('off')
    ax4.set_title('Numeric Summary')
    
    plt.tight_layout()
    
    return {
        'type': 'dataset_summary',
        'title': 'Dataset Summary',
        'image': create_base64_plot(fig)
    }

def create_column_histogram(df, column):
    """Create histogram for a specific column"""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    ax.hist(df[column].dropna(), bins=30, alpha=0.7, color='#10b981', edgecolor='black')
    ax.set_xlabel(column)
    ax.set_ylabel('Frequency')
    ax.set_title(f'Distribution of {column}')
    ax.grid(True, alpha=0.3)
    
    # Add statistics
    mean_val = df[column].mean()
    median_val = df[column].median()
    ax.axvline(mean_val, color='red', linestyle='--', alpha=0.8, label=f'Mean: {mean_val:.2f}')
    ax.axvline(median_val, color='blue', linestyle='--', alpha=0.8, label=f'Median: {median_val:.2f}')
    ax.legend()
    
    plt.tight_layout()
    return fig

def create_correlation_heatmap(df):
    """Create correlation heatmap"""
    fig, ax = plt.subplots(figsize=(10, 8))
    
    corr_matrix = df.corr()
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, 
                square=True, ax=ax, cbar_kws={'shrink': 0.8})
    
    ax.set_title('Feature Correlation Matrix', fontsize=14, fontweight='bold')
    plt.tight_layout()
    return fig

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'visualization'})

if __name__ == '__main__':
    print("🎨 Starting Visualization Service...")
    print("📊 Available at: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
