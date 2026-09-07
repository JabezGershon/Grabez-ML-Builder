import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const TSNENode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    nComponents: 2,
    perplexity: 30.0,
    earlyExaggeration: 12.0,
    learningRate: 200.0,
    nIter: 1000,
    randomState: 42
  });

  useEffect(() => {
    const processInput = async () => {
      console.log('TSNENode - useEffect triggered, data:', data);
      console.log('TSNENode - Available inputs:', Object.keys(data?.inputData || {}));
      
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('TSNENode - Parsed input found:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('TSNENode - Setting input data and running TSNE');
        setInputData(parsedInput);
        setError(null);
        await runTSNE(parsedInput);
      } else {
        console.log('TSNENode - No valid input data found');
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.nComponents, config.perplexity]);

  const runTSNE = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !inputDataToProcess.data) {
      setError('Missing input data');
      return;
    }

    const numericColumns = inputDataToProcess.numericColumns;
    if (!numericColumns || numericColumns.length < 3) {
      setError('Need at least 3 numeric columns for dimensionality reduction');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running t-SNE with config:', config);
      
      console.log('🚀 Running t-SNE with config:', config);
      
      // Extract raw data array for advanced service
      const rawData = inputDataToProcess.data || inputDataToProcess;
      
      // Use the unified advanced service for consistent high-quality results
      const mlResults = await AdvancedMLService.performAdvancedTSNE(rawData, {
        nComponents: config.nComponents,
        perplexity: config.perplexity,
        earlyExaggeration: config.earlyExaggeration,
        learningRate: config.learningRate,
        nIter: config.nIter
      });
      
      console.log('📊 t-SNE Results:', mlResults);
      
      console.log('📊 t-SNE Results:', mlResults);
      setResults(mlResults);

      const outputData = {
        type: 'dimensionality_reduction_results',
        algorithm: 't-Distributed Stochastic Neighbor Embedding',
        nComponents: config.nComponents,
        originalDimensions: mlResults.originalDimensions,
        reducedDimensions: config.nComponents,
        klDivergence: mlResults.klDivergence,
        transformedData: mlResults.transformedData,
        perplexity: config.perplexity,
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

      console.log('✅ t-SNE completed:', mlResults);
    } catch (error) {
      console.error('❌ t-SNE failed:', error);
      setError(error.message);
      
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runTSNE();
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
        <span className="node-icon">🌀</span>
        <span className="node-title">t-SNE</span>
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
            Perplexity:
            <input
              type="number"
              value={config.perplexity}
              onChange={(e) => handleConfigChange('perplexity', parseFloat(e.target.value))}
              min="5"
              max="50"
              step="1"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Balance local vs global structure
            </small>
          </label>
          
          <label>
            Learning Rate:
            <input
              type="number"
              value={config.learningRate}
              onChange={(e) => handleConfigChange('learningRate', parseFloat(e.target.value))}
              min="10"
              max="1000"
              step="10"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Optimization learning rate
            </small>
          </label>
          
          <label>
            Early Exaggeration:
            <input
              type="number"
              value={config.earlyExaggeration}
              onChange={(e) => handleConfigChange('earlyExaggeration', parseFloat(e.target.value))}
              min="4"
              max="50"
              step="1"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Controls tight cluster formation
            </small>
          </label>
          
          <label>
            Max Iterations:
            <input
              type="number"
              value={config.nIter}
              onChange={(e) => handleConfigChange('nIter', parseInt(e.target.value))}
              min="250"
              max="5000"
              step="250"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Number of optimization iterations
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
            backgroundColor: isRunning || !inputData ? '#6b7280' : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Computing t-SNE...' : '▶️ Execute t-SNE'}
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
          <div className="results-section" style={{ fontSize: '11px', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#059669' }}>🌀 t-SNE Results:</h4>
            
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
              <span>KL Divergence:</span>
              <strong>{results.klDivergence?.toFixed(4) || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Perplexity:</span>
              <strong>{config.perplexity}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Learning Rate:</span>
              <strong>{config.learningRate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Iterations:</span>
              <strong>{results.nIterations || config.nIter}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{results.dataPoints || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Converged:</span>
              <strong>{results.converged ? '✅' : '❌'}</strong>
            </div>
            
            {results.gradientNorm && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Final Gradient:</span>
                <strong>{results.gradientNorm.toFixed(6)}</strong>
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

export default TSNENode;
