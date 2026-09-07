import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';

const LoggerNode = ({ data, id }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (data.inputData) {
      // Process different types of input data
      let logContent = '';
      
      // Get all input data from connected nodes
      const inputEntries = Object.entries(data.inputData);
      
      inputEntries.forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          if (value.type === 'parsed-data') {
            logContent += `📊 Parsed Data:\n`;
            logContent += `  File: ${value.fileName}\n`;
            logContent += `  Rows: ${value.rowCount}\n`;
            logContent += `  Columns: ${value.columnCount}\n`;
            logContent += `  Numeric: ${value.numericColumns?.length || 0}\n`;
            logContent += `  Headers: [${value.headers?.join(', ') || 'none'}]\n`;
          } else if (value.type === 'ml_results') {
            logContent += `🤖 ML Results (${value.algorithm}):\n`;
            logContent += `  R² Score: ${value.r2_score?.toFixed(4) || 'N/A'}\n`;
            logContent += `  MSE: ${value.mse?.toFixed(4) || 'N/A'}\n`;
            logContent += `  Data Points: ${value.dataPoints || 'N/A'}\n`;
          } else if (value.type === 'raw-file') {
            logContent += `📁 File Data:\n`;
            logContent += `  Name: ${value.fileName}\n`;
            logContent += `  Size: ${value.size} bytes\n`;
            logContent += `  Type: ${value.file?.type || 'unknown'}\n`;
          } else {
            logContent += `🔍 Data from ${key}:\n`;
            logContent += `  Type: ${value.type || 'unknown'}\n`;
            logContent += `  Content: ${JSON.stringify(value, null, 2)}\n`;
          }
        } else {
          logContent += `📝 ${key}: ${value}\n`;
        }
      });

      if (logContent) {
        const logEntry = {
          id: Date.now() + Math.random(),
          content: logContent.trim(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'data'
        };
        setLogs((prev) => [...prev.slice(-4), logEntry]); // Keep only last 5 logs
      }
    }
  }, [data.inputData]);

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="custom-node logger-node">
      <div className="node-header">
        <div className="node-icon">📝</div>
        <div className="node-title">Logger</div>
        <button 
          onClick={clearLogs} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#6b7280', 
            fontSize: '12px', 
            cursor: 'pointer',
            padding: '2px 6px'
          }}
        >
          Clear
        </button>
      </div>
      <div className="node-content" style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '10px' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#6b7280', padding: '8px', textAlign: 'center' }}>
            No data logged yet...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="logger-entry" style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#f9fafb', borderRadius: '4px', borderLeft: '3px solid #3b82f6' }}>
              <div className="logger-time" style={{ color: '#6b7280', fontSize: '9px', marginBottom: '4px' }}>
                {log.timestamp}
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '10px', color: '#374151' }}>
                {log.content}
              </pre>
            </div>
          ))
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="data-input"
        className="handle-input"
      />
    </div>
  );
};

export default LoggerNode;
