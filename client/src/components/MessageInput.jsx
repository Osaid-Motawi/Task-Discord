import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';

const MessageInput = ({ onSend, channelName }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-form">
        <input
          type="text"
          className="message-input"
          placeholder={`Message #${channelName}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!message.trim()}
          title="Send"
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;