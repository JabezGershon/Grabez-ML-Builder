// src/components/ChatOutputNode.jsx
import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import "./NodeStyles.css";

const ChatOutputNode = ({ data, id }) => {
  const [messages, setMessages] = useState(data.messages || []);

  useEffect(() => {
    if (data?.inputData) {
      // Handle different types of input data
      Object.entries(data.inputData).forEach(([key, inputData]) => {
        if (inputData) {
          let messageContent = '';
          
          // Handle different data types
          if (inputData.type === 'parsed-data') {
            messageContent = `📊 Data parsed: ${inputData.fileName}\n${inputData.rowCount} rows, ${inputData.columnCount} columns\nNumeric columns: ${inputData.numericColumns?.join(', ') || 'none'}`;
          } else if (inputData.type === 'ml_results') {
            messageContent = `🤖 ${inputData.algorithm} Results:\nR² Score: ${inputData.r2_score?.toFixed(4) || 'N/A'}\nMSE: ${inputData.mse?.toFixed(4) || 'N/A'}\nModel trained successfully!`;
          } else if (inputData.type === 'raw-file') {
            messageContent = `📁 File uploaded: ${inputData.fileName}\nSize: ${(inputData.size / 1024).toFixed(1)} KB\nReady for processing`;
          } else if (inputData.type === 'chat' && inputData.content) {
            messageContent = inputData.content;
          } else {
            messageContent = `🔍 Data received from ${key}:\n${JSON.stringify(inputData, null, 2)}`;
          }

          const newMessage = {
            id: Date.now() + Math.random(),
            role: inputData.role || "system",
            content: messageContent,
            timestamp: new Date().toLocaleTimeString(),
            type: inputData.type || 'data'
          };

          setMessages(prev => {
            // Avoid duplicate messages by checking if similar content exists
            const isDuplicate = prev.some(msg => 
              msg.content === newMessage.content && 
              Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000
            );
            
            if (!isDuplicate) {
              const updated = [...prev.slice(-9), newMessage]; // Keep last 10 messages
              
              // Update node data
              if (data.onChange) {
                data.onChange(id, { messages: updated });
              }
              
              return updated;
            }
            return prev;
          });
        }
      });
    }
  }, [data.inputData]);

  const clearMessages = () => {
    setMessages([]);
    if (data.onChange) {
      data.onChange(id, { messages: [] });
    }
  };

  return (
    <div className="custom-node chat-output-node">
      <div className="node-header">
        <div className="node-icon">💭</div>
        <div className="node-title">Chat Output</div>
        <button 
          onClick={clearMessages} 
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

      <div className="node-content chat-messages" style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '11px' }}>
        {messages.length === 0 ? (
          <div className="empty-state" style={{ color: '#6b7280', padding: '16px', textAlign: 'center' }}>
            No messages yet...
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role}`} style={{ 
              marginBottom: '8px', 
              padding: '8px', 
              backgroundColor: msg.role === 'system' ? '#f0f9ff' : '#f9fafb',
              borderRadius: '6px',
              borderLeft: `3px solid ${msg.role === 'system' ? '#3b82f6' : '#10b981'}`
            }}>
              <div className="message-content" style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
                {msg.content}
              </div>
              <div className="message-timestamp" style={{ fontSize: '9px', color: '#6b7280', marginTop: '4px' }}>
                {msg.timestamp}
              </div>
            </div>
          ))
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="chat-input"
        className="handle-input"
      />
    </div>
  );
};

export default ChatOutputNode;
