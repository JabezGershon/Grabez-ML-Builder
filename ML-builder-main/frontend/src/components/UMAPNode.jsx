import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const UMAPNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    nComponents: 2,
    nNeighbors: 15,
    minDist: 0.1,
    metric: 'euclidean',
    learningRate: 1.0,
    nEpochs: 200,
    randomState: 42
  });

  useEffect(() => {
    const processInput = async () => {
      console.log('UMAPNode - useEffect triggered, data:', data);
      console.log('UMAPNode - Available inputs:', Object.keys(data?.inputData || {}));
      
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('UMAPNode - Parsed input found:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('UMAPNode - Setting input data and running UMAP');
        setInputData(parsedInput);
        setError(null);
        await runUMAP(parsedInput);
      } else {
        console.log('UMAPNode - No valid input data found');
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.nComponents, config.nNeighbors]);

  const runUMAP = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !Array.isArray(inputDataToProcess.data) || inputDataToProcess.data.length === 0) {
      setError('Please provide valid data first');
      return;
    }

    setIsRunning(true);
    setResults(null);
    setError(null);

    try {
      const rawData = inputDataToProcess.data;
      const results = await AdvancedMLService.performAdvancedUMAP(rawData, {
        nComponents: parseInt(config.nComponents),
        nNeighbors: parseInt(config.nNeighbors),
        minDist: parseFloat(config.minDist),
        metric: config.metric,
        learningRate: parseFloat(config.learningRate),
        nEpochs: parseInt(config.nEpochs)
      });

      setResults(results);
    } catch (error) {
      console.error('UMAP error:', error);
      setError(error.message || 'Failed to run UMAP');
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runUMAP();
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
        <span className="node-icon">🗺️</span>
        <span className="node-title">UMAP</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>
            Components:
            <select
              value={config.nComponents}
              onChange={(e) => handleConfigChange('nComponents', parseInt(e.target.value))}
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            >
              <option value={2}>2D</option>
              <option value={3}>3D</option>
            </select>
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Output dimensions
            </small>
          </label>
          
          <label>
            Neighbors:
            <input
              type="number"
              value={config.nNeighbors}
              onChange={(e) => handleConfigChange('nNeighbors', parseInt(e.target.value))}
              min="2"
              max="200"
              step="1"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Local neighborhood size
            </small>
          </label>
          
          <label>
            Min Distance:
            <input
              type="number"
              value={config.minDist}
              onChange={(e) => handleConfigChange('minDist', parseFloat(e.target.value))}
              min="0.01"
              max="1.0"
              step="0.01"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Minimum distance between points
            </small>
          </label>
          
          <label>
            Distance Metric:
            <select
              value={config.metric}
              onChange={(e) => handleConfigChange('metric', e.target.value)}
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            >
              <option value="euclidean">Euclidean</option>
              <option value="manhattan">Manhattan</option>
              <option value="cosine">Cosine</option>
              <option value="correlation">Correlation</option>
            </select>
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Distance calculation method
            </small>
          </label>
          
          <label>
            Learning Rate:
            <input
              type="number"
              value={config.learningRate}
              onChange={(e) => handleConfigChange('learningRate', parseFloat(e.target.value))}
              min="0.1"
              max="10.0"
              step="0.1"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Optimization learning rate
            </small>
          </label>
          
          <label>
            Epochs:
            <input
              type="number"
              value={config.nEpochs}
              onChange={(e) => handleConfigChange('nEpochs', parseInt(e.target.value))}
              min="50"
              max="1000"
              step="50"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Number of training epochs
            </small>
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
            backgroundColor: isRunning || !inputData ? '#6b7280' : '#0891b2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Computing UMAP...' : '▶️ Execute UMAP'}
        </button>

        {!inputData && (
          <div className="info-message" style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', padding: '8px' }}>
            Connect data source to enable dimensionality reduction
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ fontSize: '11px', color: '#ef4444', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {results && (
          <div className="results-section" style={{ fontSize: '11px', padding: '8px', backgroundColor: '#ecfeff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#0891b2' }}>🗺️ UMAP Results:</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Components:</span>
              <strong>{config.nComponents}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Original Dims:</span>
              <strong>{results.originalDimensions || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Reduced Dims:</span>
              <strong>{config.nComponents}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Neighbors:</span>
              <strong>{config.nNeighbors}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Min Distance:</span>
              <strong>{config.minDist}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Metric:</span>
              <strong>{config.metric}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Epochs:</span>
              <strong>{results.nEpochs || config.nEpochs}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{results.dataPoints || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Converged:</span>
              <strong>{results.converged ? '✅' : '❌'}</strong>
            </div>
            
            {results.reconstructionError && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Reconstruction Error:</span>
                <strong>{results.reconstructionError.toFixed(4)}</strong>
              </div>
            )}
            
            {results.trustworthiness && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Quality Metrics:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                  <span>Trustworthiness:</span>
                  <strong>{(results.trustworthiness * 100).toFixed(1)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                  <span>Continuity:</span>
                  <strong>{(results.continuity * 100).toFixed(1)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                  <span>Neighborhood Hit:</span>
                  <strong>{(results.neighborhoodHit * 100).toFixed(1)}%</strong>
                </div>
              </div>
            )}
            
            {results.crossEntropy && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Optimization:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                  <span>Cross Entropy:</span>
                  <strong>{results.crossEntropy.toFixed(4)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>Final Learning Rate:</span>
                  <strong>{results.finalLearningRate?.toFixed(4) || 'N/A'}</strong>
                </div>
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

export default UMAPNode;
