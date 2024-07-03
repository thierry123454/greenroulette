const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "*", // Be sure to restrict this in production!
      methods: ["GET", "POST"]
    }
  });

const xss = require('xss');

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('send message', (address, betChoice, betAmount, msg) => {
    const safeMessage = xss(msg);
    io.emit('message', { 
      user: address, 
      text: safeMessage, 
      betChoice: betChoice, 
      betAmount: betAmount 
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
