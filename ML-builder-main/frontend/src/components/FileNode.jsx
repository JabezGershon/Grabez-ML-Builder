import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';

const FileNode = ({ data, id }) => {
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);

      // Read file content for immediate processing
      const fileContent = await readFileContent(selectedFile);

      const outputData = {
        type: 'raw-file',
        file: selectedFile,
        fileName: selectedFile.name,
        size: selectedFile.size,
        lastModified: selectedFile.lastModified,
        content: fileContent,
        timestamp: Date.now()
      };

      setFileData(outputData);

      // Trigger real-time data propagation
      if (data.onChange) {
        data.onChange(id, {
          file: selectedFile,
          fileName: selectedFile.name,
          outputData: outputData
        });
      }

      // Also trigger immediate propagation if connected to other nodes
      if (window.dataFlowManager) {
        window.dataFlowManager.propagateData(id, outputData);
      }
    }
  };

  const handleRemoveFile = () => {
    // Clear file data
    setFileName('');
    setFileData(null);

    // Clear file input
    const fileInput = document.querySelector(`input[type="file"]`);
    if (fileInput) {
      fileInput.value = '';
    }

    // Update node data
    if (data.onChange) {
      data.onChange(id, {
        file: null,
        fileName: '',
        outputData: null
      });
    }

    // Clear propagated data
    if (window.dataFlowManager) {
      window.dataFlowManager.propagateData(id, null);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);

      if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  // Get execution status
  const status = data.status || 'idle';
  const statusColors = {
    idle: '#e5e7eb',
    running: '#fbbf24',
    completed: '#10b981',
    error: '#ef4444'
  };

  return (
    <div className={`custom-node file-node ${status}`}>
      <div className="node-header">
        <div className="node-icon">📁</div>
        <div className="node-title">File Upload</div>
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
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input"
          accept=".csv,.txt,.json,.xlsx"
        />
        {fileName && (
          <div className="file-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span className="file-name" style={{ fontSize: '12px', color: '#374151', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
            <button
              onClick={handleRemoveFile}
              className="remove-button"
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                fontSize: '10px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="file-output"
        className="handle-output"
      />
    </div>
  );
};

export default FileNode;
