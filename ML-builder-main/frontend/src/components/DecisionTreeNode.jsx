import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const DecisionTreeNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    targetColumn: '',
    testSize: 0.2,
    randomState: 42,
    maxDepth: 5,
    minSamplesSplit: 2
  });

  // Real-time processing when input data changes
  useEffect(() => {
    const processInput = async () => {
      // Look for parsed data from connected nodes (check multiple handle IDs)
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('🌳 DecisionTree: Checking inputData:', data?.inputData);
      console.log('🌳 DecisionTree: Found parsedInput:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('🌳 DecisionTree: Processing new data', parsedInput);
        setInputData(parsedInput);
        setError(null);

        // Auto-suggest last column as target if none selected
        if (!config.targetColumn && parsedInput.headers && parsedInput.headers.length > 0) {
          const suggestedTarget = parsedInput.headers[parsedInput.headers.length - 1];
          const newConfig = { ...config, targetColumn: suggestedTarget };
          setConfig(newConfig);
          if (data.onChange) {
            data.onChange(id, { config: newConfig });
          }
        }

        // Auto-run if target configured
        if (config.targetColumn) {
          await executeModel();
        }
      } else {
        // Clear data if no valid input
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.targetColumn]);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    if (data.onChange) {
      data.onChange(id, { config: newConfig });
    }
  };

  const executeModel = async () => {
    if (!inputData || !inputData.data) {
      setError('No valid input data available');
      return;
    }

    if (!config.targetColumn) {
      setError('Please select a target column');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running Decision Tree with config:', config);
      console.log('🔍 Input data structure:', inputData);
      console.log('🔍 Data array length:', inputData?.data?.length);
      console.log('🔍 Sample data:', inputData?.data?.slice(0, 2));
      console.log('🔍 Target column:', config.targetColumn);

      // Use real ML service - pass the data array and target column in config
      const mlResults = await AdvancedMLService.performAdvancedDecisionTree(inputData.data, {
        targetColumn: config.targetColumn,
        maxDepth: config.maxDepth || 5,
        minSamplesSplit: config.minSamplesSplit || 2,
        minSamplesLeaf: config.minSamplesLeaf || 1,
        criterion: config.criterion || 'gini',
        testSize: 0.2,
        randomState: 42
      });

      console.log('📊 ML Results received:', mlResults);
      setResults(mlResults);

      // Create output data
      const outputData = {
        type: 'ml_results',
        algorithm: 'Decision Tree',
        accuracy: mlResults.accuracy,
        dataPoints: mlResults.dataPoints,
        targetColumn: mlResults.targetColumn,
        predictions: mlResults.predictions,
        treeDepth: mlResults.treeDepth,
        ...mlResults,
        timestamp: Date.now()
      };

      // Update node data and propagate
      if (data.onChange) {
        data.onChange(id, {
          results: mlResults,
          outputData: outputData,
          status: 'completed'
        });
      }

      // Trigger real-time propagation
      if (window.dataFlowManager) {
        window.dataFlowManager.propagateData(id, outputData);
      }

      console.log('✅ Decision Tree completed:', mlResults);
    } catch (error) {
      console.error('❌ Decision Tree failed:', error);
      setError(error.message);
      setResults(null);
      
      // Set error status
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Get execution status
  const status = data.status || (isRunning ? 'running' : 'idle');
  const statusColors = {
    idle: '#e5e7eb',
    running: '#fbbf24',
    completed: '#10b981',
    error: '#ef4444'
  };

  return (
    <div className={`custom-node ml-node decision-tree-node ${status}`}>
      <div className="node-header">
        <div className="node-icon">🌳</div>
        <div className="node-title">Decision Tree</div>
        {status !== 'idle' && (
          <div
            className="status-indicator"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColors[status],
              marginLeft: 'auto',
              animation: status === 'running' ? 'pulse 1.5s infinite' : 'none'
            }}
          />
        )}
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Target Column:
            <select
              value={config.targetColumn}
              onChange={(e) => handleConfigChange('targetColumn', e.target.value)}
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            >
              <option value="">Select target column</option>
              {inputData?.headers?.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Max Depth:
            <input
              type="number"
              value={config.maxDepth}
              onChange={(e) => handleConfigChange('maxDepth', parseInt(e.target.value))}
              min="1"
              max="20"
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
            backgroundColor: isRunning || !inputData || !config.targetColumn ? '#6b7280' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData || !config.targetColumn ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Running...' : '▶️ Execute Model'}
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
        
        {error && <div className="error-message" style={{ fontSize: '11px', color: '#ef4444', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>{error}</div>}
        
        {results && (
          <div className="results-section" style={{ fontSize: '11px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#1e40af' }}>📊 Results:</h4>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Tree Depth:</span>
              <strong>{results.treeDepth || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{results.dataPoints || 'N/A'}</strong>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', color: '#065f46', fontSize: '10px' }}>
              ✅ Model trained successfully
            </div>
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="data-input"
        className="handle-input"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="model-output"
        className="handle-output"
      />
    </div>
  );
};

export default DecisionTreeNode;
