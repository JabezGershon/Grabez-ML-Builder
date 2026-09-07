import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';

const ChatInputNode = ({ data, id }) => {
  const [message, setMessage] = useState(data.message || '');
  const [chatHistory, setChatHistory] = useState(data.chatHistory || []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newHistory = [...chatHistory, { type: 'user', content: message }];
      setChatHistory(newHistory);
      setMessage('');

      // ✅ update node data and send output downstream
      if (data.onChange) {
        data.onChange(id, {
          message: '',
          chatHistory: newHistory,
          outputData: {
            type: 'chat',
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="custom-node chat-input-node">
      <div className="node-header">
        <div className="node-icon">💬</div>
        <div className="node-title">Chat Input</div>
      </div>

      <div className="node-content">
        <div className="chat-history">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.type}`}>
              {msg.content}
            </div>
          ))}
        </div>

        <div className="chat-input-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input"
            rows={2}
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="chat-output"
        className="handle-output"
      />
    </div>
  );
};

export default ChatInputNode;
