import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';
import AdvancedMLService from '../services/mlService_advanced';

const GaussianMixtureNode = ({ data, id }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [config, setConfig] = useState({
    nComponents: 3,
    covarianceType: 'full',
    maxIter: 100,
    tol: 1e-3,
    regCovar: 1e-6,
    randomState: 42
  });

  useEffect(() => {
    const processInput = async () => {
      console.log('GaussianMixtureNode - useEffect triggered, data:', data);
      console.log('GaussianMixtureNode - Available inputs:', Object.keys(data?.inputData || {}));
      
      const parsedInput = data?.inputData?.['data-input'] ||
                         data?.inputData?.['parser-output'] ||
                         Object.values(data?.inputData || {}).find(input => input?.type === 'parsed-data');

      console.log('GaussianMixtureNode - Parsed input found:', parsedInput);

      if (parsedInput && parsedInput.data && parsedInput.headers) {
        console.log('GaussianMixtureNode - Setting input data and running Gaussian Mixture');
        setInputData(parsedInput);
        setError(null);
        await runGaussianMixture(parsedInput);
      } else {
        console.log('GaussianMixtureNode - No valid input data found');
        setInputData(null);
        setResults(null);
        setError(null);
      }
    };

    processInput();
  }, [data?.inputData, config.nComponents, config.covarianceType]);

  const runGaussianMixture = async (inputDataToProcess = inputData) => {
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
      console.log('🚀 Running Gaussian Mixture with config:', config);
      
      console.log('🚀 Running Gaussian Mixture with config:', config);
      
      // Extract raw data array for advanced service
      const rawData = inputDataToProcess.data || inputDataToProcess;
      
      // Use the unified advanced service for consistent high-quality results
      const mlResults = await AdvancedMLService.performAdvancedGaussianMixture(rawData, {
        nComponents: config.nComponents,
        covarianceType: config.covarianceType,
        maxIter: config.maxIter,
        tol: config.tol
      });
      
      console.log('📊 Gaussian Mixture Results:', mlResults);
      
      console.log('📊 Gaussian Mixture Results:', mlResults);
      setResults(mlResults);

      const outputData = {
        type: 'clustering_results',
        algorithm: 'Gaussian Mixture Model',
        nComponents: config.nComponents,
        logLikelihood: mlResults.logLikelihood,
        aic: mlResults.aic,
        bic: mlResults.bic,
        silhouetteScore: mlResults.silhouetteScore,
        dataPoints: mlResults.dataPoints,
        clusterLabels: mlResults.labels,
        probabilities: mlResults.probabilities,
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

      console.log('✅ Gaussian Mixture completed:', mlResults);
    } catch (error) {
      console.error('❌ Gaussian Mixture failed:', error);
      setError(error.message);
      
      if (data.onChange) {
        data.onChange(id, { status: 'error' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeModel = async () => {
    await runGaussianMixture();
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
        <span className="node-title">Gaussian Mixture</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>
            Components:
            <input
              type="number"
              value={config.nComponents}
              onChange={(e) => handleConfigChange('nComponents', parseInt(e.target.value))}
              min="1"
              max="20"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Number of mixture components
            </small>
          </label>
          
          <label>
            Covariance Type:
            <select
              value={config.covarianceType}
              onChange={(e) => handleConfigChange('covarianceType', e.target.value)}
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            >
              <option value="full">Full</option>
              <option value="tied">Tied</option>
              <option value="diag">Diagonal</option>
              <option value="spherical">Spherical</option>
            </select>
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Shape of covariance parameters
            </small>
          </label>
          
          <label>
            Max Iterations:
            <input
              type="number"
              value={config.maxIter}
              onChange={(e) => handleConfigChange('maxIter', parseInt(e.target.value))}
              min="10"
              max="1000"
              step="10"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Maximum EM iterations
            </small>
          </label>
          
          <label>
            Tolerance:
            <input
              type="number"
              value={config.tol}
              onChange={(e) => handleConfigChange('tol', parseFloat(e.target.value))}
              min="1e-6"
              max="1e-1"
              step="1e-6"
              className="config-input"
              style={{ width: '100%', padding: '4px', fontSize: '11px', marginTop: '2px' }}
            />
            <small style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
              Convergence threshold
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
            backgroundColor: isRunning || !inputData ? '#6b7280' : '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !inputData ? 'not-allowed' : 'pointer',
            marginBottom: '8px'
          }}
        >
          {isRunning ? '🔄 EM Clustering...' : '▶️ Execute GMM'}
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
          <div className="results-section" style={{ fontSize: '11px', padding: '8px', backgroundColor: '#faf5ff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#7c3aed' }}>🎭 GMM Results:</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Components:</span>
              <strong>{config.nComponents}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Log-Likelihood:</span>
              <strong>{results.logLikelihood?.toFixed(2) || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>AIC:</span>
              <strong>{results.aic?.toFixed(2) || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>BIC:</span>
              <strong>{results.bic?.toFixed(2) || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Silhouette Score:</span>
              <strong>{results.silhouetteScore?.toFixed(4) || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Converged:</span>
              <strong>{results.converged ? '✅' : '❌'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Iterations:</span>
              <strong>{results.nIterations || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Data Points:</span>
              <strong>{results.dataPoints || 'N/A'}</strong>
            </div>
            
            {results.componentWeights && results.componentWeights.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Component Weights:</div>
                {results.componentWeights.slice(0, 5).map((weight, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>Component {idx + 1}:</span>
                    <strong>{(weight * 100).toFixed(1)}%</strong>
                  </div>
                ))}
                {results.componentWeights.length > 5 && (
                  <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', marginTop: '4px' }}>
                    ... and {results.componentWeights.length - 5} more components
                  </div>
                )}
              </div>
            )}
            
            {results.clusterSizes && results.clusterSizes.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Cluster Assignments:</div>
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

export default GaussianMixtureNode;
