import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const MultinomialNBNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    alpha: 1.0,
    fitPrior: true,
    classifierType: 'multinomial',
    featureSelection: false,
  nFeatures: 10,
  targetColumn: ''
  });

  useEffect(() => {
    const processInput = async () => {
      console.log('MultinomialNBNode - useEffect triggered, data:', data);
      console.log('MultinomialNBNode - Available inputs:', Object.keys(data?.inputData || {}));
      
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('MultinomialNBNode - Parsed input found:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('MultinomialNBNode - Setting input data and running MultinomialNB');
        setInputData(parsedInput);
        setError(null);
        if (!config.targetColumn) {
          const suggested = parsedInput.textColumns?.[0] || parsedInput.headers?.[parsedInput.headers.length - 1];
          if (suggested) {
            const newConfig = { ...config, targetColumn: suggested };
            setConfig(newConfig);
            if (data.onChange) data.onChange(id, { config: newConfig });
          }
        }
        await runMultinomialNB(parsedInput);
      } else {
        console.log('MultinomialNBNode - No valid input data found');
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.alpha, config.fitPrior]);

  const runMultinomialNB = async (inputDataToProcess = inputData) => {
    if (!inputDataToProcess || !inputDataToProcess.data) {
      setError('Missing input data');
      return;
    }

  const numericColumns = inputDataToProcess.numericColumns;
  const textColumns = inputDataToProcess.textColumns;
    
    if (!numericColumns || numericColumns.length === 0) {
      setError('Need at least one numeric feature column');
      return;
    }

    // Auto-select target column for classification (prefer text columns for categories)
  const targetColumn = config.targetColumn || textColumns?.[0] || inputDataToProcess.headers?.[inputDataToProcess.headers.length - 1] || numericColumns?.[0];
    if (!targetColumn) {
      setError('No target column available');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Running Multinomial Naive Bayes with config:', config);
      console.log('🎯 Auto-selected target column:', targetColumn);
      
      // Extract raw data array for advanced service
      const rawData = inputDataToProcess.data || inputDataToProcess;
      
      // Use the unified advanced service for consistent high-quality results
      const mlResults = await AdvancedMLService.performAdvancedMultinomialNB(rawData, {
        targetColumn: targetColumn,
        testSize: 0.2,
        alpha: config.alpha,
        fitPrior: config.fitPrior
      });
      
      console.log('📊 Multinomial NB Results:', mlResults);
      
      console.log('📊 Multinomial NB Results:', mlResults);
      setResults(mlResults);

      const outputData = {
        type: 'classification_results',
        algorithm: 'Multinomial Naive Bayes',
        accuracy: mlResults.accuracy,
        precision: mlResults.precision,
        recall: mlResults.recall,
        f1Score: mlResults.f1Score,
        alpha: config.alpha,
        classDistribution: mlResults.classDistribution,
        featureImportance: mlResults.featureImportance,
        predictions: mlResults.predictions,
        targetColumn: targetColumn,
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

      console.log('✅ Multinomial NB completed:', mlResults);
    } catch (error) {
      console.error('❌ Multinomial NB failed:', error);
      setError(error.message);
      
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runMultinomialNB();
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
        <span className="node-icon">🎲</span>
        <span className="node-title">Multinomial NB</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>
            Target Column:
            <select
              value={config.targetColumn || ''}
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
            Alpha (Smoothing):
            <input
              type="number"
              value={config.alpha}
              onChange={(e) => handleConfigChange('alpha', parseFloat(e.target.value))}
              min="0.01"
              max="10.0"
              step="0.1"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Laplace smoothing parameter
            </small>
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={config.fitPrior}
              onChange={(e) => handleConfigChange('fitPrior', e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Learn Class Priors
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Whether to learn class prior probabilities
            </small>
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={config.featureSelection}
              onChange={(e) => handleConfigChange('featureSelection', e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Feature Selection
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Use chi-square feature selection
            </small>
          </label>
          
          {config.featureSelection && (
            <label>
              Max Features:
              <input
                type="number"
                value={config.nFeatures}
                onChange={(e) => handleConfigChange('nFeatures', parseInt(e.target.value))}
                min="1"
                max="100"
                className="config-input"
                style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
              />
              <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
                Number of top features to select
              </small>
            </label>
          )}
        </div>
        
        <button
          onClick={executeModel}
          disabled={isRunning || !inputData}
          className="execute-button"
          style={{ 
            width: '100%', 
            padding: '6px', 
            fontSize: '11px',
            backgroundColor: isRunning || !inputData ? '#6b7280' : '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 Training NB...' : '▶️ Execute Multinomial NB'}
        </button>

        {!inputData && (
          <div className="info-message" style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', padding: '8px' }}>
            Connect data source to enable classification
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ fontSize: '11px', color: '#ef4444', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {results && (
          <div className="results-section" style={{ fontSize: '11px', padding: '8px', backgroundColor: '#fff7ed', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#ea580c' }}>🎲 Multinomial NB Results:</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Accuracy:</span>
              <strong>{(results.accuracy * 100).toFixed(2)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Precision:</span>
              <strong>{(results.precision * 100).toFixed(2)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Recall:</span>
              <strong>{(results.recall * 100).toFixed(2)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>F1-Score:</span>
              <strong>{(results.f1Score * 100).toFixed(2)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Alpha:</span>
              <strong>{config.alpha}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Training Samples:</span>
              <strong>{results.trainSize || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Test Samples:</span>
              <strong>{results.testSize || 'N/A'}</strong>
            </div>
            
            {results.classDistribution && Object.keys(results.classDistribution).length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Class Distribution:</div>
                {Object.entries(results.classDistribution).slice(0, 4).map(([className, count]) => (
                  <div key={className} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>Class {className}:</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            )}

            {results.featureImportance && results.featureImportance.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Top Features:</div>
                {results.featureImportance.slice(0, 4).map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>{feature.feature}:</span>
                    <strong>{feature.importance.toFixed(4)}</strong>
                  </div>
                ))}
              </div>
            )}

            {results.crossValidation && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Cross Validation:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                  <span>CV Mean:</span>
                  <strong>{(results.crossValidation.mean * 100).toFixed(2)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>CV Std:</span>
                  <strong>±{(results.crossValidation.std * 100).toFixed(2)}%</strong>
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

export default MultinomialNBNode;
