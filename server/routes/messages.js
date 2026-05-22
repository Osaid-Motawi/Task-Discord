const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:channelId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ channel: req.params.channelId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, channelId } = req.body;
    const message = new Message({
      content,
      sender: req.user.id,
      channel: channelId
    });
    await message.save();
    const populated = await message.populate('sender', 'username');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message)
      return res.status(404).json({ message: 'Message not found' });

    if (message.sender.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    message.content = req.body.content;
    message.edited = true;
    await message.save();

    const populated = await message.populate('sender', 'username');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message)
      return res.status(404).json({ message: 'Message not found' });

    if (message.sender.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await message.deleteOne();
    res.json({ message: 'Message deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;