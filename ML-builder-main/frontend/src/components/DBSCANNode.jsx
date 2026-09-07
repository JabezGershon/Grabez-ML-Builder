import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const DBSCANNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    eps: 0.5,
    minSamples: 5,
    metric: 'euclidean',
    algorithm: 'auto'
  });

  useEffect(() => {
    const processInput = async () => {
      console.log('DBSCANNode - useEffect triggered, data:', data);
      console.log('DBSCANNode - Available inputs:', Object.keys(data?.inputData || {}));
      
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('DBSCANNode - Parsed input found:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('DBSCANNode - Setting input data and running DBSCAN');
        setInputData(parsedInput);
        setError(null);
        await runDBSCAN(parsedInput);
      } else {
        console.log('DBSCANNode - No valid input data found');
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.eps, config.minSamples]);

  const runDBSCAN = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !inputDataToProcess.data) {
      setError('Missing input data');
      return;
    }

    const numericColumns = inputDataToProcess.numericColumns;
    if (!numericColumns || numericColumns.length < 2) {
      setError('Need at least 2 numeric columns for clustering');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running DBSCAN with config:', config);
      
      console.log('🚀 Running DBSCAN with config:', config);
      
      // Extract raw data array for advanced service
      const rawData = inputDataToProcess.data || inputDataToProcess;
      
      // Use the unified advanced service for consistent high-quality results
      const mlResults = await AdvancedMLService.performAdvancedDBSCAN(rawData, {
        eps: config.eps,
        minSamples: config.minSamples,
        metric: config.metric
      });
      
      console.log('📊 DBSCAN Results:', mlResults);
      
      console.log('📊 DBSCAN Results:', mlResults);
      setResults(mlResults);

      const outputData = {
        type: 'clustering_results',
        algorithm: 'DBSCAN Clustering',
        nClusters: mlResults.nClusters,
        nNoise: mlResults.nNoise,
        silhouetteScore: mlResults.silhouetteScore,
        dataPoints: mlResults.dataPoints,
        clusterLabels: mlResults.labels,
        eps: config.eps,
        minSamples: config.minSamples,
        ...mlResults,
        timestamp: Date.now()
      };

      if (data.onChange) {
        data.onChange(id, {
          results: mlResults,
          outputData: outputData,
          status: 'completed'
        });
      }

      if (window.dataFlowManager) {
        window.dataFlowManager.propagateData(id, outputData);
      }

      console.log('✅ DBSCAN completed:', mlResults);
    } catch (error) {
      console.error('❌ DBSCAN failed:', error);
      setError(error.message);
      
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runDBSCAN();
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (data.onChange) {
      data.onChange(id, { config: newConfig });
    }
  };

  return (
    <div className="custom-node ml-node">
      <Handle 
        type="target" 
        position={Position.Left} 
        id="data-input"
        className="handle-input" 
      />
      
      <div className="node-header">
        <span className="node-icon">🎪</span>
        <span className="node-title">DBSCAN Clustering</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>
            Epsilon (eps):
            <input
              type="number"
              value={config.eps}
              onChange={(e) => handleConfigChange('eps', parseFloat(e.target.value))}
              min="0.1"
              max="5.0"
              step="0.1"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Maximum distance between samples
            </small>
          </label>
          
          <label>
            Min Samples:
            <input
              type="number"
              value={config.minSamples}
              onChange={(e) => handleConfigChange('minSamples', parseInt(e.target.value))}
              min="2"
              max="50"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Min samples in neighborhood
            </small>
          </label>
          
          <label>
            Distance Metric:
            <select
              value={config.metric}
              onChange={(e) => handleConfigChange('metric', e.target.value)}
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px' }}
            >
              <option value="euclidean">Euclidean</option>
              <option value="manhattan">Manhattan</option>
              <option value="cosine">Cosine</option>
            </select>
          </label>
        </div>
        
        <button
          onClick={executeModel}
          disabled={isRunning || !inputData}
          className="execute-button"
          style={{ 
            width: '100%', 
            padding: '6px', 
            fontSize: '11px',
            backgroundColor: isRunning || !inputData ? '#6b7280' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Density Clustering...' : '▶️ Execute DBSCAN'}
        </button>

        {!inputData && (
          <div className="info-message" style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', padding: '8px' }}>
            Connect data source to enable clustering
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ fontSize: '11px', color: '#ef4444', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {results && (
          <div className="results-section" style={{ fontSize: '11px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#1e40af' }}>🎪 DBSCAN Results:</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Clusters Found:</span>
              <strong>{results.nClusters || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Noise Points:</span>
              <strong>{results.nNoise || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Silhouette Score:</span>
              <strong>{results.silhouetteScore?.toFixed(4) || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Epsilon (eps):</span>
              <strong>{config.eps}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Min Samples:</span>
              <strong>{config.minSamples}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Core Points:</span>
              <strong>{results.nCorePoints || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{results.dataPoints || 'N/A'}</strong>
            </div>
            
            {results.clusterSizes && results.clusterSizes.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Cluster Sizes:</div>
                {results.clusterSizes.slice(0, 5).map((size, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>Cluster {idx}:</span>
                    <strong>{size} points</strong>
                  </div>
                ))}
                {results.clusterSizes.length > 5 && (
                  <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', marginTop: '4px' }}>
                    ... and {results.clusterSizes.length - 5} more clusters
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        id="model-output"
        className="handle-output" 
      />
    </div>
  );
};

export default DBSCANNode;
