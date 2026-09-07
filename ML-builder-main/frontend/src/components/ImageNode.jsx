import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';

const ImageNode = ({ data, id }) => {
  const [image, setImage] = useState(data.image || null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(e.target.result);

        if (data.onChange) {
          data.onChange(id, {
            image: e.target.result,
            outputData: {
              type: 'image',
              name: file.name,
              size: file.size,
              width: img.width,
              height: img.height
            }
          });
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Execution status
  const status = data.status || 'idle';
  const statusColors = {
    idle: '#e5e7eb',
    running: '#fbbf24',
    completed: '#10b981',
    error: '#ef4444'
  };

  return (
    <div className={`custom-node image-node ${status}`}>
      <div className="node-header">
        <div className="node-icon">🖼️</div>
        <div className="node-title">Image Input</div>
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
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
        />
        {image && (
          <div className="image-preview">
            <img
              src={image}
              alt="Uploaded preview"
              style={{ maxWidth: '100%', borderRadius: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="image-output"
        className="handle-output"
      />
    </div>
  );
};

export default ImageNode;
