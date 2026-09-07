import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const KNNNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    targetColumn: '',
    nNeighbors: 5,
    weights: 'uniform', // uniform, distance
    metric: 'euclidean', // euclidean, manhattan, minkowski
    testSize: 0.2,
    randomState: 42
  });

  useEffect(() => {
    const processInput = async () => {
      console.log('KNNNode - useEffect triggered, data:', data);
      console.log('KNNNode - Available inputs:', Object.keys(data?.inputData || {}));
      
      // Look for parsed data from connected nodes (check multiple handle IDs)
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('KNNNode - Parsed input found:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('KNNNode - Setting input data');
        setInputData(parsedInput);
        setError(null);

        if (!config.targetColumn && parsedInput.textColumns && parsedInput.textColumns.length > 0) {
          const suggestedTarget = parsedInput.textColumns[0];
          const newConfig = { ...config, targetColumn: suggestedTarget };
          setConfig(newConfig);
          if (data.onChange) {
            data.onChange(id, { config: newConfig });
          }
        }

        if (config.targetColumn) {
          await runKNN(parsedInput);
        }
      } else {
        console.log('KNNNode - No valid input data found');
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.targetColumn, config.nNeighbors]);

  const runKNN = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !inputDataToProcess.data || !config.targetColumn) {
      setError('Missing input data or target column');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running KNN with config:', config);
      
      // Extract raw data array for advanced service
      const rawData = inputDataToProcess.data || inputDataToProcess;
      
      // Use the unified advanced service for consistent high-quality results
      const mlResults = await AdvancedMLService.performAdvancedKNN(rawData, {
        targetColumn: config.targetColumn,
        testSize: 0.2,
        nNeighbors: config.nNeighbors,
        weights: config.weights,
        metric: config.metric
      });
      
      console.log('📊 KNN Results:', mlResults);
      
      console.log('📊 KNN Results:', mlResults);
      setResults(mlResults);

      const outputData = {
        type: 'ml_results',
        algorithm: 'K-Nearest Neighbors',
        accuracy: mlResults.accuracy || mlResults.r2_score,
        nNeighbors: config.nNeighbors,
        dataPoints: mlResults.dataPoints,
        targetColumn: mlResults.targetColumn,
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

      console.log('✅ KNN completed:', mlResults);
    } catch (error) {
      console.error('❌ KNN failed:', error);
      setError(error.message);
      
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runKNN();
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
        <span className="node-icon">🎯</span>
        <span className="node-title">K-Nearest Neighbors</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>
            Target Column:
            <select
              value={config.targetColumn}
              onChange={(e) => handleConfigChange('targetColumn', e.target.value)}
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px' }}
            >
              <option value="">Select target...</option>
              {(inputData?.headers || inputData?.numericColumns || []).map((col, idx) => (
                <option key={idx} value={col}>{col}</option>
              ))}
            </select>
          </label>
          
          <label>
            Number of Neighbors (k):
            <input
              type="number"
              value={config.nNeighbors}
              onChange={(e) => handleConfigChange('nNeighbors', parseInt(e.target.value))}
              min="1"
              max="50"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
          </label>
          
          <label>
            Weights:
            <select
              value={config.weights}
              onChange={(e) => handleConfigChange('weights', e.target.value)}
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px' }}
            >
              <option value="uniform">Uniform</option>
              <option value="distance">Distance</option>
            </select>
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
              <option value="minkowski">Minkowski</option>
            </select>
          </label>
          
          <label>
            Test Size:
            <input
              type="number"
              value={config.testSize}
              onChange={(e) => handleConfigChange('testSize', parseFloat(e.target.value))}
              min="0.1"
              max="0.9"
              step="0.1"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
          </label>
        </div>
        
        <button
          onClick={executeModel}
          disabled={isRunning || !inputData || !config.targetColumn}
          className="execute-button"
          style={{ 
            width: '100%', 
            padding: '6px', 
            fontSize: '11px',
            backgroundColor: isRunning || !inputData || !config.targetColumn ? '#6b7280' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData || !config.targetColumn ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Finding Neighbors...' : '▶️ Execute KNN'}
        </button>

        {!inputData && (
          <div className="info-message" style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', padding: '8px' }}>
            Connect data source to enable ML processing
          </div>
        )}

        {inputData && !config.targetColumn && (
          <div className="info-message" style={{ fontSize: '11px', color: '#f59e0b', textAlign: 'center', padding: '8px' }}>
            Select a target column to proceed
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ fontSize: '11px', color: '#ef4444', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {results && (
          <div className="results-section" style={{ fontSize: '11px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#1e40af' }}>🎯 KNN Results:</h4>
            
            {results.isClassification ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Accuracy:</span>
                  <strong>{results.accuracy ? `${(results.accuracy * 100).toFixed(1)}%` : 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Precision:</span>
                  <strong>{results.precision ? `${(results.precision * 100).toFixed(1)}%` : 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Recall:</span>
                  <strong>{results.recall ? `${(results.recall * 100).toFixed(1)}%` : 'N/A'}</strong>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>R² Score:</span>
                  <strong>{results.r2Score ? `${(results.r2Score * 100).toFixed(1)}%` : 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>RMSE:</span>
                  <strong>{results.rmse?.toFixed(4) || 'N/A'}</strong>
                </div>
              </>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Neighbors (k):</span>
              <strong>{config.nNeighbors}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Weights:</span>
              <strong>{config.weights}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Distance:</span>
              <strong>{config.metric}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>CV Score:</span>
              <strong>{results.cvMeanScore?.toFixed(4) || 'N/A'} ± {results.cvStdScore?.toFixed(4) || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{results.dataPoints || 'N/A'}</strong>
            </div>
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

export default KNNNode;
