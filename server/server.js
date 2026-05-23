const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ MongoDB Error:', err));

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
  });

  socket.on('send_message', (messageData) => {
    io.to(messageData.channelId).emit('receive_message', messageData);
  });

  socket.on('delete_message', ({ msgId, channelId }) => {
    io.to(channelId).emit('message_deleted', msgId);
  });

  socket.on('edit_message', ({ updated, channelId }) => {
    io.to(channelId).emit('message_edited', updated);
  });
  socket.on('create_channel', (channel) => {
  io.emit('channel_created', channel);
});

socket.on('delete_channel', (channelId) => {
  io.emit('channel_deleted', channelId);
});

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));