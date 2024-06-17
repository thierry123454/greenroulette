const https = require('https');
const fs = require('fs');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const server = https.createServer({
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem')
}, app);
const io = socketIo(server, {
    cors: {
      origin: "*",  // Be sure to restrict this in production!
      methods: ["GET", "POST"]
    }
});  

const TIMER_DURATION = 240; // Duration of the timer in seconds
let timer = TIMER_DURATION;

// Function to start the countdown
function startTimer() {
  const countdown = setInterval(() => {
    timer--;
    io.emit('timer', { countdown: timer });

    if (timer <= 0) {
      timer = TIMER_DURATION;  // Reset the timer
      clearInterval(countdown);  // Stop the interval
      startTimer();  // Restart the timer
    }
  }, 1000); // Update the timer every second
}

// Start the timer as soon as the server starts
startTimer();

// Handling a new connection
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('timer', { countdown: timer });  // Immediately send the current timer

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve the app
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
