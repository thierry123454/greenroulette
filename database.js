require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const validator = require('validator');

const app = express();
const port = process.env.PORT || 6969;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const validateAndSanitizeInput = (input) => {
  if (!input || typeof input !== 'string' || !validator.isAlphanumeric(input, 'en-US', {ignore: ' .-_'})) {
      return false;
  }
  return validator.trim(input);
};


// Create a MySQL connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASS, // Your MySQL password
  database: 'GreenRoulette'
});

// Verify MySQL connection
pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log('Connected as ID ' + connection.threadId);
  connection.release();
});

// Route to handle adding a new player
app.post('/api/add-player', (req, res) => {
  const { address } = req.body;
  const query = `
    INSERT INTO players (address, username, total_win, total_donated)
    SELECT * FROM (SELECT ? as address, NULL as username, 0.00000000 as total_win, 0.00000000 as total_donated) AS tmp
    WHERE NOT EXISTS (
      SELECT address FROM players WHERE address = ?
    ) LIMIT 1;
  `;
  pool.query(query, [address, address], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Player added', results });
  });
});

app.post('/api/update-username', (req, res) => {
  const { username, userAddress } = req.body;

  let sanitizedUsername = validateAndSanitizeInput(username);
  
  if (!sanitizedUsername) {
    sanitizedUsername = null;
  }

  const sql = `UPDATE players SET username = ? WHERE address = ?`;
  pool.query(sql, [sanitizedUsername, userAddress], (error, results) => {
      if (error) {
          console.error('Failed to update username:', error);
          return res.status(500).send({ success: false });
      }
      res.send({ success: true });
  });
});

app.post('/api/donations', (req, res) => {
  const { userAddress, donationAmount, donationDate } = req.body;
  const sql = `
    INSERT INTO donations (user_address, donation_amount, donation_date) 
    VALUES (?, ?, ?);
  `;

  let sanitizedAmount = validateAndSanitizeInput(donationAmount);
  
  if (!sanitizedAmount) {
    sanitizedAmount = null;
  }

  pool.query(sql, [userAddress, sanitizedAmount, donationDate], (err, result) => {
    if (err) {
      console.error('Error inserting donation:', err);
      res.status(500).send('Error recording donation');
    } else {
      res.send('Donation recorded successfully');
    }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
