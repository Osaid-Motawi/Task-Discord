import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import MessageInput from './MessageInput';
import {
  FiHash,
  FiEdit2,
  FiTrash2,
  FiMessageCircle
} from 'react-icons/fi';

const socket = io('http://localhost:5000');

const ChatWindow = ({ selectedChannel }) => {
  const [messages, setMessages]     = useState([]);
  const [editingId, setEditingId]   = useState(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredId, setHoveredId]   = useState(null);
  const { token, user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedChannel) return;

    socket.emit('join_channel', selectedChannel._id);

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedChannel._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages');
      }
    };

    fetchMessages();

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('message_deleted', (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
    });

    socket.on('message_edited', (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('message_edited');
    };
  }, [selectedChannel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content) => {
    if (!content.trim() || !selectedChannel) return;

    const messageData = {
      content,
      channelId: selectedChannel._id,
      sender: { _id: user.id, username: user.username },
      createdAt: new Date().toISOString(),
    };

    socket.emit('send_message', messageData);

    try {
      await axios.post(
        'http://localhost:5000/api/messages',
        { content, channelId: selectedChannel._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to save message');
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await axios.delete(`http://localhost:5000/api/messages/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit('delete_message', {
        msgId,
        channelId: selectedChannel._id,
      });
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (err) {
      console.error('Failed to delete message');
    }
  };

  const handleEditSubmit = async (msgId) => {
    if (!editContent.trim()) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/messages/${msgId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('edit_message', {
        updated: res.data,
        channelId: selectedChannel._id,
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? res.data : m))
      );
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit message');
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditContent(msg.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (!selectedChannel) {
    return (
      <div className="chat-window empty">
        <FiMessageCircle size={48} />
        <p>Select a channel to start chatting</p>
      </div>
    );
  }
  return (
    <div className="chat-window">
      <div className="chat-header">
        <FiHash size={18} />
        <span className="chat-header-name">{selectedChannel.name}</span>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="no-messages">
            <FiMessageCircle size={40} />
            <span>No messages yet — be the first!</span>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`message ${msg.sender?.username === user.username ? 'own' : ''}`}
            onMouseEnter={() => setHoveredId(msg._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="message-avatar">
              {msg.sender?.username?.[0].toUpperCase()}
            </div>
            <div className="message-body">
              <div className="message-meta">
                <span className="message-author">{msg.sender?.username}</span>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {msg.edited && <span className="edited-tag">(edited)</span>}
              </div>
              {editingId === msg._id ? (
                <div className="edit-form">
                  <input
                    className="edit-input"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSubmit(msg._id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button className="edit-save"
                      onClick={() => handleEditSubmit(msg._id)}>Save</button>
                    <button className="edit-cancel" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="message-content">{msg.content}</p>
              )}
            </div>
            {msg.sender?.username === user.username
              && hoveredId === msg._id
              && editingId !== msg._id && (
              <div className="message-actions">
                <button
                  className="action-btn edit"
                  onClick={() => startEdit(msg)}
                  title="Edit">
                  <FiEdit2 size={13} /> Edit </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(msg._id)}
                  title="Delete">
                  <FiTrash2 size={13} /> Delete </button>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput
        onSend={handleSend}
        channelName={selectedChannel.name}
      />
    </div>
  );
};

export default ChatWindow;