import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FiHash,
  FiPlus,
  FiTrash2,
  FiLogOut,
  FiMessageSquare
} from 'react-icons/fi';

const Sidebar = ({ onSelectChannel, selectedChannel }) => {
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [hoveredChannel, setHoveredChannel] = useState(null);
  const [error, setError] = useState('');
  const { user, token, logout } = useAuth();

  useEffect(() => { fetchChannels(); }, []);

  const fetchChannels = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/channels', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChannels(res.data);
      if (res.data.length > 0) onSelectChannel(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch channels');
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannel.trim()) return;
    setError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/channels',
        { name: newChannel.trim().toLowerCase().replace(/\s+/g, '-') },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChannels([...channels, res.data]);
      setNewChannel('');
      setShowInput(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating channel');
    }
  };

  const handleDeleteChannel = async (e, channelId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this channel and all its messages?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/channels/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = channels.filter((c) => c._id !== channelId);
      setChannels(updated);
      if (selectedChannel?._id === channelId) {
        onSelectChannel(updated[0] || null);
      }
    } catch (err) {
      console.error('Failed to delete channel');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FiMessageSquare size={18} />
        Discord Clone
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>Channels</span>
          <button
            className="add-btn"
            onClick={() => setShowInput(!showInput)}
            title="Add channel"
          >
            <FiPlus size={16} />
          </button>
        </div>
        {showInput && (
          <form onSubmit={handleCreateChannel} className="new-channel-form">
            <input
              type="text"
              placeholder="channel-name"
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              autoFocus
            />
            <button type="submit">Add Channel</button>
            {error && <p className="channel-error">{error}</p>}
          </form>
        )}
        <ul className="channel-list">
          {channels.map((channel) => (
            <li
              key={channel._id}
              className={`channel-item ${selectedChannel?._id === channel._id ? 'active' : ''}`}
              onClick={() => onSelectChannel(channel)}
              onMouseEnter={() => setHoveredChannel(channel._id)}
              onMouseLeave={() => setHoveredChannel(null)}
            >
              <FiHash size={15} />
              <span className="channel-name">{channel.name}</span>

              {hoveredChannel === channel._id && (
                <button
                  className="delete-channel-btn"
                  onClick={(e) => handleDeleteChannel(e, channel._id)}
                  title="Delete channel"
                >
                  <FiTrash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">
            {user?.username?.[0].toUpperCase()}
          </div>
          <span className="username">{user?.username}</span>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          <FiLogOut size={17} />
        </button>
      </div>

    </div>
  );
};

export default Sidebar;