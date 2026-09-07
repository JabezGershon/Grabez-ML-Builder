import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';

const TextNode = ({ data, id }) => {
  const [text, setText] = useState(data.text || '');

  const handleTextChange = (event) => {
    const newText = event.target.value;
    setText(newText);
    // Update node data
    if (data.onChange) {
      data.onChange(id, {
        text: newText,
        outputData: {
          type: 'text',
          content: newText,
          length: newText.length,
          wordCount: newText.split(/\s+/).filter(word => word.length > 0).length
        }
      });
    }
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
    <div className={`custom-node text-node ${status}`}>
      <div className="node-header">
        <div className="node-icon">📝</div>
        <div className="node-title">Text Input</div>
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
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your text here..."
          className="text-input"
          rows={4}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="text-output"
        className="handle-output"
      />
    </div>
  );
};

export default TextNode;
