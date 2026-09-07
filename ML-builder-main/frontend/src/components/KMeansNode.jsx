import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';
import { MLMetrics } from '../utils/mlResultsFormatter';

const KMeansNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    nClusters: 3,
    maxIter: 300,
    nInit: 10,
    randomState: 42,
    tolerance: 1e-4
  });

  useEffect(() => {
    const processInput = async () => {
      console.log('KMeansNode - useEffect triggered, data:', data);
      console.log('KMeansNode - Available inputs:', Object.keys(data?.inputData || {}));
      
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('KMeansNode - Parsed input found:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('KMeansNode - Setting input data and running KMeans');
        setInputData(parsedInput);
        setError(null);

        // Auto-run clustering when data is available
        await runKMeans(parsedInput);
      } else {
        console.log('KMeansNode - No valid input data found');
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.nClusters, config.maxIter]);

  const runKMeans = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !inputDataToProcess.data) {
      setError('Missing input data');
      return;
    }

    // Check for numeric columns
    const numericColumns = inputDataToProcess.numericColumns;
    if (!numericColumns || numericColumns.length < 2) {
      setError('Need at least 2 numeric columns for clustering');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running K-Means with config:', config);
      
  const mlResults = await AdvancedMLService.performAdvancedKMeans(inputDataToProcess.data || inputDataToProcess, {
        nClusters: config.nClusters,
        init: config.init,
        nInit: config.nInit,
        maxIter: config.maxIter
      });
      
      console.log('📊 K-Means Results:', mlResults);
      setResults(mlResults);

      const outputData = {
        type: 'clustering_results',
        algorithm: 'K-Means Clustering',
        nClusters: config.nClusters,
        silhouetteScore: mlResults.silhouetteScore,
        inertia: mlResults.inertia,
        dataPoints: mlResults.dataPoints,
        clusterLabels: mlResults.labels,
        centroids: mlResults.centroids,
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

      console.log('✅ K-Means completed:', mlResults);
    } catch (error) {
      console.error('❌ K-Means failed:', error);
      setError(error.message);
      setResults(null);
      
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runKMeans();
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
        <span className="node-icon">🎭</span>
        <span className="node-title">K-Means Clustering</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>
            Number of Clusters (k):
            <input
              type="number"
              value={config.nClusters}
              onChange={(e) => handleConfigChange('nClusters', parseInt(e.target.value))}
              min="2"
              max="20"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
          </label>
          
          <label>
            Max Iterations:
            <input
              type="number"
              value={config.maxIter}
              onChange={(e) => handleConfigChange('maxIter', parseInt(e.target.value))}
              min="50"
              max="1000"
              step="50"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
          </label>
          
          <label>
            Number of Initializations:
            <input
              type="number"
              value={config.nInit}
              onChange={(e) => handleConfigChange('nInit', parseInt(e.target.value))}
              min="1"
              max="20"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
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
            backgroundColor: isRunning || !inputData ? '#6b7280' : '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Clustering...' : '▶️ Execute K-Means'}
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
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#1e40af' }}>🎭 Clustering Results:</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Clusters:</span>
              <strong>{config.nClusters}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Silhouette Score:</span>
              <strong>{MLMetrics.formatSilhouetteScore(results)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Inertia:</span>
              <strong>{MLMetrics.formatInertia(results)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Iterations:</span>
              <strong>{results.nIter || 'Not Available'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{MLMetrics.formatDataPoints(results)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Features:</span>
              <strong>{results.numberOfFeatures || 'Not Available'}</strong>
            </div>
            
            {results.clusterSizes && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Cluster Sizes:</div>
                {(Array.isArray(results.clusterSizes)
                  ? results.clusterSizes.map((size, idx) => ({ label: idx, size }))
                  : Object.entries(results.clusterSizes).map(([label, size]) => ({ label, size }))
                ).map(({ label, size }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>Cluster {label}:</span>
                    <strong>{size} points</strong>
                  </div>
                ))}
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

export default KMeansNode;
