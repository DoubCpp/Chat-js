const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

router.post('/sendMessage', async (req, res) => {
  const { username, text } = req.body;
  const message = new Message({ username, text });

  try {
    await message.save();
    res.status(201).send('Message sent successfully');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(10);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
