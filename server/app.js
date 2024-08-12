const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const User = require('./models/User');
const Message = require('./models/Message');
const { trackConnection } = require('./connectionTracker');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'client')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

io.on('connection', async (socket) => {
  console.log('New client connected');

  socket.on('join', async (username) => {
    try {
      let user = await User.findOne({ username });

      if (!user) {
        user = new User({ username });
        await user.save();
      }

      socket.username = username;
      console.log(`${username} joined the chat`);

      trackConnection(socket, username);

      if (!activeUsers.some(user => user.username === username)) {
        activeUsers.push({ username });
      }

      const messages = await Message.find().sort({ createdAt: 1 });
      socket.emit('initMessages', messages);

      updateActiveUsers();
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { username, text } = data;
      const message = new Message({ username, text, createdAt: new Date() });
      await message.save();
      io.emit('receiveMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      activeUsers = activeUsers.filter(user => user.username !== socket.username);
      updateActiveUsers();
    }
  });

  function updateActiveUsers() {
    io.emit('updateActiveUsers', activeUsers);
  }
});

const messageRouter = require('./routes/messages');
app.use('/api/messages', messageRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server running on ${url}`);

  const { default: open } = await import('open');
  open(url);  
});

let activeUsers = [];
