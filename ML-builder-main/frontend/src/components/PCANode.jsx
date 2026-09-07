import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const PCANode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    nComponents: 2,
    whiten: false,
    randomState: 42
  });

  useEffect(() => {
    const processInput = async () => {
      console.log('PCANode - useEffect triggered, data:', data);
      console.log('PCANode - Available inputs:', Object.keys(data?.inputData || {}));
      
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('PCANode - Parsed input found:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('PCANode - Setting input data and running PCA');
        setInputData(parsedInput);
        setError(null);

        // Auto-run PCA when data is available
        await runPCA(parsedInput);
      } else {
        console.log('PCANode - No valid input data found');
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.nComponents]);

  const runPCA = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !inputDataToProcess.data) {
      setError('Missing input data');
      return;
    }

    // Check for numeric columns
    const numericColumns = inputDataToProcess.numericColumns;
    if (!numericColumns || numericColumns.length < 2) {
      setError('Need at least 2 numeric columns for PCA');
      return;
    }

    // Ensure nComponents doesn't exceed available features
    const maxComponents = Math.min(numericColumns.length, inputDataToProcess.data.length);
    if (config.nComponents > maxComponents) {
      setError(`Maximum ${maxComponents} components available with current data`);
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running PCA with config:', config);
      
      console.log('🚀 Running PCA with config:', config);
      
      // Extract raw data array for advanced service
      const rawData = inputDataToProcess.data || inputDataToProcess;
      
      // Use the unified advanced service for consistent high-quality results
  const mlResults = await AdvancedMLService.performAdvancedPCA(rawData, {
        nComponents: config.nComponents,
        whiten: config.whiten,
        svdSolver: config.svdSolver
      });
      
      console.log('📊 PCA Results:', mlResults);
      
      console.log('📊 PCA Results:', mlResults);
      setResults(mlResults);

      const outputData = {
        type: 'dimensionality_reduction_results',
        algorithm: 'Principal Component Analysis',
        nComponents: config.nComponents,
        explainedVarianceRatio: mlResults.explainedVarianceRatio,
        totalVariance: mlResults.totalVariance,
        transformedData: mlResults.transformedData,
        components: mlResults.components,
        dataPoints: mlResults.dataPoints,
        originalDimensions: mlResults.originalDimensions,
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

      console.log('✅ PCA completed:', mlResults);
    } catch (error) {
      console.error('❌ PCA failed:', error);
      setError(error.message);
      
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runPCA();
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (data.onChange) {
      data.onChange(id, { config: newConfig });
    }
  };

  const maxComponents = inputData?.numericColumns?.length || 10;

  return (
    <div className="custom-node ml-node">
      <Handle 
        type="target" 
        position={Position.Left} 
        id="data-input"
        className="handle-input" 
      />
      
      <div className="node-header">
        <span className="node-icon">🔄</span>
        <span className="node-title">Principal Component Analysis</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>
            Number of Components:
            <input
              type="number"
              value={config.nComponents}
              onChange={(e) => handleConfigChange('nComponents', parseInt(e.target.value))}
              min="1"
              max={maxComponents}
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Max: {maxComponents} (based on features)
            </small>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <input
              type="checkbox"
              checked={config.whiten}
              onChange={(e) => handleConfigChange('whiten', e.target.checked)}
              style={{ margin: 0 }}
            />
            <span style={{ fontSize: '12px' }}>Whiten Components</span>
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
            backgroundColor: isRunning || !inputData ? '#6b7280' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Analyzing...' : '▶️ Execute PCA'}
        </button>

        {!inputData && (
          <div className="info-message" style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', padding: '8px' }}>
            Connect data source to enable PCA
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ fontSize: '11px', color: '#ef4444', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {results && (
          <div className="results-section" style={{ fontSize: '11px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#1e40af' }}>🔄 PCA Results:</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Components:</span>
              <strong>{config.nComponents}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Total Variance:</span>
              <strong>{results.totalVariance !== undefined ? `${(results.totalVariance * 100).toFixed(2)}%` : 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Original Dimensions:</span>
              <strong>{results.originalDimensions ?? 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{results.dataPoints || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Dimensionality:</span>
              <strong>{results.originalFeatures} → {config.nComponents}</strong>
            </div>
            
      {results.explainedVarianceRatio && results.explainedVarianceRatio.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Variance by Component:</div>
        {results.explainedVarianceRatio.slice(0, Math.min(5, results.explainedVarianceRatio.length)).map((variance, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>PC{idx + 1}:</span>
                    <strong>{(variance * 100).toFixed(1)}%</strong>
                  </div>
                ))}
        {results.explainedVarianceRatio.length > 5 && (
                  <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', marginTop: '4px' }}>
          ... and {results.explainedVarianceRatio.length - 5} more
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

export default PCANode;
