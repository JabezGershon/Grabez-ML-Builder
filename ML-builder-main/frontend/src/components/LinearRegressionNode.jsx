import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const LinearRegressionNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    targetColumn: '',
    testSize: 0.2,
    randomState: 42
  });

  // Real-time processing when input data changes
  useEffect(() => {
    const processInput = async () => {
      // Look for parsed data from connected nodes (check multiple handle IDs)
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('🤖 LinearRegression: Checking inputData:', data?.inputData);
      console.log('🤖 LinearRegression: Found parsedInput:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('🤖 LinearRegression: Processing new data', parsedInput);
        setInputData(parsedInput);
        setError(null);

        // Auto-suggest first numeric column as target if none selected
        if (!config.targetColumn && parsedInput.numericColumns && parsedInput.numericColumns.length > 0) {
          const suggestedTarget = parsedInput.numericColumns[parsedInput.numericColumns.length - 1];
          const newConfig = { ...config, targetColumn: suggestedTarget };
          setConfig(newConfig);
          if (data.onChange) {
            data.onChange(id, { config: newConfig });
          }
        }

        // Auto-run if we have a target column configured
        if (config.targetColumn) {
          await runLinearRegression(parsedInput);
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

  const runLinearRegression = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !inputDataToProcess.data) {
      setError('No valid input data available');
      return;
    }

    if (!config.targetColumn) {
      setError('Please select a target column');
      return;
    }

    // Validate target column exists and is numeric
    const targetValues = inputDataToProcess.data.map(row => row[config.targetColumn]).filter(val => val != null);
    const numericTargets = targetValues.filter(val => typeof val === 'number');
    
    if (numericTargets.length < 2) {
      setError(`Target column '${config.targetColumn}' must have at least 2 numeric values`);
      return;
    }

    // Validate we have numeric features
    const numericColumns = inputDataToProcess.numericColumns.filter(col => col !== config.targetColumn);
    if (numericColumns.length === 0) {
      setError('No numeric feature columns available for regression');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running Linear Regression with config:', config);
      console.log('🔍 Input data structure:', inputDataToProcess);
      console.log('🔍 Input data sample:', inputDataToProcess?.data?.slice(0, 2));
      console.log('🔍 Target column:', config.targetColumn);

      // Use real ML service - pass the data array and target column in config
      const mlResults = await AdvancedMLService.performAdvancedLinearRegression(inputDataToProcess.data, {
        targetColumn: config.targetColumn,
        fitIntercept: config.fitIntercept,
        normalize: config.normalize
      });

      console.log('📊 ML Results received:', mlResults);
      console.log('📊 Results keys:', Object.keys(mlResults));
      console.log('📊 R² Score:', mlResults.r2_score);
      console.log('📊 Best Model:', mlResults.bestModel);
      
      setResults(mlResults);
      console.log('🔍 Results state will be set to:', mlResults);

      // Create output data
      const outputData = {
        type: 'ml_results',
        algorithm: 'Linear Regression',
        r2_score: mlResults.r2_score,
        mse: mlResults.mse,
        dataPoints: mlResults.dataPoints,
        targetColumn: mlResults.targetColumn,
        predictions: mlResults.predictions,
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

      console.log('✅ Linear Regression completed:', mlResults);
    } catch (error) {
      console.error('❌ Linear Regression failed:', error);
      setError(error.message);
      
      // Set error status
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runLinearRegression();
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
    <div className={`custom-node ml-node linear-regression-node ${status}`}>
      <div className="node-header">
        <div className="node-icon">📈</div>
        <div className="node-title">Linear Regression</div>
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
              {inputData?.numericColumns?.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
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
            backgroundColor: isRunning || !inputData || !config.targetColumn ? '#6b7280' : '#3b82f6',
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
              <span>R² Score:</span>
              <strong>{results.r2Score ? `${(results.r2Score * 100).toFixed(1)}%` : 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>MSE:</span>
              <strong>{results.mse?.toFixed(4) || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>RMSE:</span>
              <strong>{results.rmse?.toFixed(4) || 'N/A'}</strong>
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
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Only numeric targets are supported. For categorical targets, use Logistic Regression, SVM, Decision Tree, or Random Forest.
            </small>
    </div>
  );
};

export default LinearRegressionNode;
