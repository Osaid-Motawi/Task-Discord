const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: 1 });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Channel.findOne({ name });
    if (existing)
      return res.status(400).json({ message: 'Channel name already exists' });

    const channel = new Channel({ name, description });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel)
      return res.status(404).json({ message: 'Channel not found' });

    await Message.deleteMany({ channel: req.params.id });
    await channel.deleteOne();

    res.json({ message: 'Channel deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;