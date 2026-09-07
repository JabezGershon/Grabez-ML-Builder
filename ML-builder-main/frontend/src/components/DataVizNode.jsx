// src/components/DataVizNode.jsx
import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import "./NodeStyles.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF6384"];

const DataVizNode = ({ data, id }) => {
  const [vizType, setVizType] = useState("table");
  const [dataset, setDataset] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Prepare dataset depending on input type
  const prepareVizData = (inputData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 DataViz: Processing input data:', inputData);
      let processed = null;

      // Handle different input data types
      const allInputs = Object.values(inputData);
      for (const input of allInputs) {
        if (!input) continue;

        console.log('📊 DataViz: Checking input type:', input.type, input);

        if (input.type === "parsed-data" && Array.isArray(input.data)) {
          processed = {
            title: input.fileName || "Dataset",
            data: input.data.slice(0, 10), // Show first 10 rows
            headers: input.headers || Object.keys(input.data[0] || {}),
          };
          console.log('✅ DataViz: Processed parsed data');
          break;
        } else if (input.type === "ml_results" || input.algorithm || 
                   input.type?.includes('_results') || 
                   input.r2_score !== undefined || input.accuracy !== undefined) {
          // Enhanced ML results handling for advanced algorithms
          console.log('🔍 DataViz: Processing advanced ML results:', input);
          const metrics = [];
          
          // Handle different ML result structures with comprehensive metric extraction
          
          // Regression metrics
          if (typeof input.r2_score === 'number') {
            metrics.push({ metric: 'R² Score', value: parseFloat(input.r2_score.toFixed(4)), category: 'Regression' });
          }
          if (typeof input.mse === 'number') {
            metrics.push({ metric: 'MSE', value: parseFloat(input.mse.toFixed(4)), category: 'Error' });
          }
          if (typeof input.rmse === 'number') {
            metrics.push({ metric: 'RMSE', value: parseFloat(input.rmse.toFixed(4)), category: 'Error' });
          }
          if (typeof input.mae === 'number') {
            metrics.push({ metric: 'MAE', value: parseFloat(input.mae.toFixed(4)), category: 'Error' });
          }
          
          // Classification metrics
          if (typeof input.accuracy === 'number') {
            metrics.push({ metric: 'Accuracy', value: parseFloat(input.accuracy.toFixed(4)), category: 'Classification' });
          }
          if (typeof input.precision === 'number') {
            metrics.push({ metric: 'Precision', value: parseFloat(input.precision.toFixed(4)), category: 'Classification' });
          }
          if (typeof input.recall === 'number') {
            metrics.push({ metric: 'Recall', value: parseFloat(input.recall.toFixed(4)), category: 'Classification' });
          }
          if (typeof input.f1_score === 'number') {
            metrics.push({ metric: 'F1 Score', value: parseFloat(input.f1_score.toFixed(4)), category: 'Classification' });
          }
          if (typeof input.auc_score === 'number') {
            metrics.push({ metric: 'AUC Score', value: parseFloat(input.auc_score.toFixed(4)), category: 'Classification' });
          }
          
          // Model complexity metrics
          if (typeof input.dataPoints === 'number') {
            metrics.push({ metric: 'Data Points', value: input.dataPoints, category: 'Data' });
          }
          if (typeof input.treeDepth === 'number') {
            metrics.push({ metric: 'Tree Depth', value: input.treeDepth, category: 'Model' });
          }
          if (typeof input.nLeaves === 'number') {
            metrics.push({ metric: 'Tree Leaves', value: input.nLeaves, category: 'Model' });
          }
          if (typeof input.numberOfFeatures === 'number') {
            metrics.push({ metric: 'Features Used', value: input.numberOfFeatures, category: 'Data' });
          }
          
          // Cross-validation metrics
          if (typeof input.cvMeanScore === 'number') {
            metrics.push({ metric: 'CV Mean Score', value: parseFloat(input.cvMeanScore.toFixed(4)), category: 'Cross-Validation' });
          }
          if (typeof input.cvStdScore === 'number') {
            metrics.push({ metric: 'CV Std Score', value: parseFloat(input.cvStdScore.toFixed(4)), category: 'Cross-Validation' });
          }
          
          // Advanced model parameters
          if (typeof input.alpha === 'number') {
            metrics.push({ metric: 'Regularization α', value: parseFloat(input.alpha.toFixed(6)), category: 'Hyperparameters' });
          }
          if (typeof input.lambda === 'number') {
            metrics.push({ metric: 'Lambda λ', value: parseFloat(input.lambda.toFixed(6)), category: 'Hyperparameters' });
          }
          if (typeof input.learningRate === 'number') {
            metrics.push({ metric: 'Learning Rate', value: parseFloat(input.learningRate.toFixed(6)), category: 'Hyperparameters' });
          }
          if (typeof input.maxIterations === 'number') {
            metrics.push({ metric: 'Max Iterations', value: input.maxIterations, category: 'Training' });
          }
          
          // Performance object (comprehensive scan)
          if (input.performance && typeof input.performance === 'object') {
            Object.entries(input.performance).forEach(([key, value]) => {
              if (typeof value === 'number' && !metrics.some(m => m.metric.toLowerCase().includes(key.toLowerCase()))) {
                const formattedKey = key.replace(/([A-Z])/g, ' $1')
                                     .replace(/_/g, ' ')
                                     .replace(/^./, str => str.toUpperCase());
                metrics.push({ 
                  metric: formattedKey, 
                  value: parseFloat(value.toFixed(4)),
                  category: 'Performance'
                });
              }
            });
          }
          
          // Cross-validation scores array
          if (input.cvScores && Array.isArray(input.cvScores)) {
            const mean = input.cvScores.reduce((a, b) => a + b, 0) / input.cvScores.length;
            const std = Math.sqrt(input.cvScores.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / input.cvScores.length);
            metrics.push({ 
              metric: 'CV Mean', 
              value: parseFloat(mean.toFixed(4)),
              category: 'Cross-Validation'
            });
            metrics.push({ 
              metric: 'CV Std', 
              value: parseFloat(std.toFixed(4)),
              category: 'Cross-Validation'
            });
          }
          
          // Feature importance (if available)
          if (input.featureImportance && typeof input.featureImportance === 'object') {
            const importanceEntries = Object.entries(input.featureImportance)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5); // Top 5 features
            
            importanceEntries.forEach(([feature, importance], index) => {
              metrics.push({
                metric: `Top Feature ${index + 1}`,
                value: `${feature}: ${parseFloat(importance.toFixed(4))}`,
                category: 'Feature Importance'
              });
            });
          }
          
          // Model comparison results (if multiple models were trained)
          if (input.modelComparison && Array.isArray(input.modelComparison)) {
            input.modelComparison.forEach((model, index) => {
              if (model.score !== undefined) {
                metrics.push({
                  metric: `${model.name || `Model ${index + 1}`}`,
                  value: parseFloat(model.score.toFixed(4)),
                  category: 'Model Comparison'
                });
              }
            });
          }

          if (metrics.length > 0) {
            processed = {
              title: `${input.algorithm || 'ML'} Advanced Results`,
              data: metrics,
              headers: ["metric", "value", "category"],
            };
            console.log('✅ DataViz: Processed advanced ML results with metrics:', metrics);
            break;
          } else {
            console.log('⚠️ DataViz: ML results found but no metrics extracted from:', Object.keys(input));
          }
        } else if (input.type === "raw-file") {
          processed = {
            title: `File: ${input.fileName}`,
            data: [
              { property: 'File Name', value: input.fileName },
              { property: 'File Size', value: `${(input.size / 1024).toFixed(1)} KB` },
              { property: 'Status', value: 'Uploaded' }
            ],
            headers: ["property", "value"],
          };
          console.log('✅ DataViz: Processed file data');
          break;
        } else if (Array.isArray(input)) {
          processed = {
            title: "Array Data",
            data: input.slice(0, 10),
            headers: input.length > 0 ? Object.keys(input[0] || {}) : [],
          };
          console.log('✅ DataViz: Processed array data');
          break;
        } else {
          // Try to process any object with numeric values
          console.log('🔍 DataViz: Attempting to process unknown input type:', input);
          const entries = Object.entries(input).filter(([key, value]) => typeof value === 'number');
          if (entries.length > 0) {
            const metrics = entries.map(([key, value]) => ({
              metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              value: typeof value === 'number' ? parseFloat(value.toFixed(4)) : value
            }));
            
            processed = {
              title: "Data Metrics",
              data: metrics,
              headers: ["metric", "value"],
            };
            console.log('✅ DataViz: Processed generic object with metrics:', metrics);
            break;
          }
        }
      }

      if (processed && processed.data && processed.data.length > 0) {
        setDataset(processed.data);
        setHeaders(processed.headers);
        console.log('✅ DataViz: Dataset updated:', processed);
      } else {
        console.log('❌ DataViz: No valid data found in inputs:', allInputs);
        setError("No valid data received for visualization");
        setDataset([]);
        setHeaders([]);
      }
    } catch (err) {
      console.error('❌ DataViz: Error processing input:', err);
      setError("Error processing input: " + err.message);
      setDataset([]);
      setHeaders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // detect headers from first row
  const detectHeaders = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    if (typeof data[0] === "object" && data[0] !== null) {
      return Object.keys(data[0]);
    }
    return ["value"];
  };

  // pick a string column for x-axis
  const findLabelKey = (data) => {
    if (!Array.isArray(data) || data.length === 0) return null;
    const sample = data[0];
    if (typeof sample !== "object" || sample === null) return null;

    for (const key of Object.keys(sample)) {
      if (typeof sample[key] === "string" || isNaN(sample[key])) {
        return key;
      }
    }
    return Object.keys(sample)[0];
  };

  // 🔄 re-run when new input comes
  useEffect(() => {
    if (data?.inputData) {
      prepareVizData(data.inputData);
    }
  }, [data?.inputData]);

  // 🔹 Render visualization
  const renderVisualization = () => {
    if (isLoading) return <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>;
    if (error) return <div className="error-text" style={{ padding: '16px', color: '#ef4444', fontSize: '12px' }}>{error}</div>;
    if (!dataset || dataset.length === 0) return <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Waiting for data...</div>;

    const labelKey = findLabelKey(dataset) || headers[0];
    const numericCols = headers.filter((h) =>
      dataset.some((row) => typeof row[h] === "number")
    );
    const yKey = numericCols[0] || (headers.includes("value") ? "value" : headers[1]);

    switch (vizType) {
      case "bar":
        if (!labelKey || !yKey) return <div style={{ padding: '16px', color: '#6b7280' }}>No suitable data for bar chart</div>;
        return (
          <div style={{ padding: '8px', overflowX: 'auto' }}>
            <BarChart width={280} height={180} data={dataset}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelKey} fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey={yKey} fill="#3b82f6" />
            </BarChart>
          </div>
        );
      case "line":
        if (!labelKey || !yKey) return <div style={{ padding: '16px', color: '#6b7280' }}>No suitable data for line chart</div>;
        return (
          <div style={{ padding: '8px', overflowX: 'auto' }}>
            <LineChart width={280} height={180} data={dataset}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelKey} fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey={yKey} stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </div>
        );
      case "pie":
        if (!labelKey || !yKey) return <div style={{ padding: '16px', color: '#6b7280' }}>No suitable data for pie chart</div>;
        return (
          <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
            <PieChart width={280} height={200}>
              <Pie
                data={dataset}
                dataKey={yKey}
                nameKey={labelKey}
                cx="50%"
                cy="50%"
                outerRadius={70}
                fill="#8884d8"
                label={(entry) => `${entry[labelKey]}: ${entry[yKey]}`}
              >
                {dataset.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        );
      case "table":
        return (
          <div style={{ padding: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            <table className="viz-table" style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  {headers.map((h) => (
                    <th key={h} style={{ padding: '4px', border: '1px solid #e5e7eb', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    {headers.map((h) => (
                      <td key={h} style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                        {typeof row[h] === 'number' ? 
                          (row[h] % 1 === 0 ? row[h] : row[h].toFixed(4)) : 
                          String(row[h] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "json":
        return (
          <div style={{ padding: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            <pre className="viz-json" style={{ fontSize: '9px', margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(dataset, null, 2)}
            </pre>
          </div>
        );
      default:
        return <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Select visualization type</div>;
    }
  };

  return (
    <div className="custom-node data-viz-node">
      <div className="node-header">
        <div className="node-icon">📊</div>
        <div className="node-title">Data Viz</div>
        <select
          value={vizType}
          onChange={(e) => setVizType(e.target.value)}
          className="viz-select"
        >
          <option value="table">Table</option>
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
          <option value="json">JSON</option>
        </select>
      </div>

      <div className="node-content">{renderVisualization()}</div>

      <Handle
        type="target"
        position={Position.Left}
        id="viz.input"
        className="handle-input"
      />
    </div>
  );
};

export default DataVizNode;
