const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true
   },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  edited: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);