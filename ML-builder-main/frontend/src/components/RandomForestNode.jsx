import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';
import { MLMetrics } from '../utils/mlResultsFormatter';

const RandomForestNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    targetColumn: '',
    nTrees: 100,
    maxDepth: 10,
    minSamplesSplit: 2,
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

      console.log('🌲 RandomForest: Checking inputData:', data?.inputData);
      console.log('🌲 RandomForest: Found parsedInput:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('🌲 RandomForest: Processing new data', parsedInput);
        setInputData(parsedInput);
        setError(null);

        // Auto-suggest target column (use last header like DecisionTree, but prefer numeric columns)
        if (!config.targetColumn && parsedInput.headers && parsedInput.headers.length > 0) {
          // For regression, prefer last numeric column, fallback to last header
          const numericColumns = parsedInput.numericColumns;
          const suggestedTarget = (numericColumns && numericColumns.length > 0) 
            ? numericColumns[numericColumns.length - 1] 
            : parsedInput.headers[parsedInput.headers.length - 1];
          const newConfig = { ...config, targetColumn: suggestedTarget };
          setConfig(newConfig);
          if (data.onChange) {
            data.onChange(id, { config: newConfig });
          }
        }

        // Auto-run if target configured
        if (config.targetColumn) {
          await runRandomForest(parsedInput);
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

  const runRandomForest = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !inputDataToProcess.data || !config.targetColumn) {
      setError('Missing input data or target column');
      return;
    }

    // Pre-check: require at least 6 rows to align with service validation
    const rowCount = Array.isArray(inputDataToProcess.data) ? inputDataToProcess.data.length : 0;
    if (rowCount < 6) {
      setError('Need at least 6 data points for Random Forest');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running Random Forest with config:', config);
      console.log('🔍 Input data structure:', inputDataToProcess);
      console.log('🔍 Data array length:', inputDataToProcess?.data?.length);
      console.log('🔍 Sample data:', inputDataToProcess?.data?.slice(0, 2));
      
      // Extract raw data array for advanced service
      const rawData = inputDataToProcess.data || inputDataToProcess;
      
      // Use the unified advanced service for consistent high-quality results
      const mlResults = await AdvancedMLService.performAdvancedRandomForest(rawData, {
        targetColumn: config.targetColumn,
        testSize: 0.2,
        nTrees: config.nTrees || 100,
        maxDepth: config.maxDepth || 15,
        minSamplesSplit: config.minSamplesSplit || 2,
        randomState: 42
      });
      
      console.log('📊 Random Forest Results:', mlResults);
      setResults(mlResults);

      // Create output data
      const outputData = {
        type: 'ml_results',
        algorithm: 'Random Forest',
        accuracy: mlResults.accuracy || mlResults.r2_score,
        importance: mlResults.featureImportance,
        dataPoints: mlResults.dataPoints,
        targetColumn: mlResults.targetColumn,
        nTrees: mlResults.nTrees,
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

      if (window.dataFlowManager) {
        window.dataFlowManager.propagateData(id, outputData);
      }

      console.log('✅ Random Forest completed:', mlResults);
    } catch (error) {
      console.error('❌ Random Forest failed:', error);
      setError(error.message);
      
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runRandomForest();
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
        <span className="node-icon">🌲</span>
        <span className="node-title">Random Forest</span>
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
            Number of Trees:
            <input
              type="number"
              value={config.nTrees}
              onChange={(e) => handleConfigChange('nTrees', parseInt(e.target.value))}
              min="10"
              max="500"
              step="10"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
          </label>
          
          <label>
            Max Depth:
            <input
              type="number"
              value={config.maxDepth}
              onChange={(e) => handleConfigChange('maxDepth', parseInt(e.target.value))}
              min="3"
              max="20"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
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
            backgroundColor: isRunning || !inputData || !config.targetColumn ? '#6b7280' : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData || !config.targetColumn ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Training Forest...' : '▶️ Execute Random Forest'}
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
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#1e40af' }}>🌲 Forest Results:</h4>
            
            {results.isClassification ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Accuracy:</span>
                  <strong>{MLMetrics.formatAccuracy(results)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Precision:</span>
                  <strong>{MLMetrics.formatPrecision(results)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Recall:</span>
                  <strong>{MLMetrics.formatRecall(results)}</strong>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>R² Score:</span>
                  <strong>{MLMetrics.formatR2Score(results)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>MAE:</span>
                  <strong>{MLMetrics.formatMAE(results)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>RMSE:</span>
                  <strong>{MLMetrics.formatRMSE(results)}</strong>
                </div>
              </>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Trees:</span>
              <strong>{results.nTrees || config.nTrees}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>CV Score:</span>
              <strong>{MLMetrics.formatCVScore(results)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Best Model:</span>
              <strong style={{ fontSize: '10px' }}>{MLMetrics.formatAlgorithmName(results)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{MLMetrics.formatDataPoints(results)}</strong>
            </div>
            
            {results.featureImportance && Object.keys(results.featureImportance).length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Top Features:</div>
                {Object.entries(results.featureImportance)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([feature, importance]) => (
                    <div key={feature} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                      <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feature}:</span>
                      <strong>{importance.toFixed(3)}</strong>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
  {/* Removed duplicate target handle (already defined at top) */}
      
      <Handle 
        type="source" 
        position={Position.Right} 
        id="model-output"
        className="handle-output" 
      />
    </div>
  );
};

export default RandomForestNode;
