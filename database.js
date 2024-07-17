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
  const { userAddress, donationAmountUSD, donationAmountETH, donationDate } = req.body;

  const donationInsertSql = `
    INSERT INTO donations (user_address, donation_amount, donation_date) 
    VALUES (?, ?, ?);
  `;

  const playerUpdateSql = `
    UPDATE players 
    SET total_donated = total_donated + ? 
    WHERE address = ?;
  `;

  let sanitizedAmountUSD = validateAndSanitizeInput(donationAmountUSD);
  let sanitizedAmountETH = validateAndSanitizeInput(donationAmountETH);
  
  if (!sanitizedAmountUSD) {
    return res.status(400).send('Invalid donation amount');
  }

  if (!sanitizedAmountETH) {
    return res.status(400).send('Invalid donation amount');
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).send('Database connection error');
    }

    connection.beginTransaction(err => {
      if (err) {
        console.error('Error beginning transaction:', err);
        return res.status(500).send('Database transaction error');
      }

      connection.query(donationInsertSql, [userAddress || null, sanitizedAmountUSD, donationDate], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            console.error('Error inserting donation:', err);
            res.status(500).send('Error recording donation');
          });
        }

        // Only proceed with updating the player's total_donated if userAddress is provided
        if (userAddress) {
          connection.query(playerUpdateSql, [sanitizedAmountETH, userAddress], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                console.error('Error updating player total donated:', err);
                res.status(500).send('Error updating total donated');
              });
            }

            connection.commit(err => {
              if (err) {
                return connection.rollback(() => {
                  console.error('Error committing transaction:', err);
                  res.status(500).send('Transaction commit error');
                });
              }

              res.send('Donation recorded and total donated updated successfully');
            });
          });
        } else {
          // Commit transaction if no user address to update
          connection.commit(err => {
            if (err) {
              return connection.rollback(() => {
                console.error('Error committing transaction:', err);
                res.status(500).send('Transaction commit error');
              });
            }

            res.send('Anonymous donation recorded successfully');
          });
        }
      });
    });
  });
});

app.get('/api/get_donations', (req, res) => {
  const sql = `SELECT donation_date, user_address, donation_amount FROM donations ORDER BY donation_date DESC LIMIT 10`;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching donations:', err);
      res.status(500).send('Error fetching donations');
    } else {
      res.json(results);
    }
  });
});

// Endpoint to get top donators
app.get('/api/top-donators', (req, res) => {
  const sql = `
    SELECT address, username, total_donated 
    FROM players 
    WHERE total_donated > 0
    ORDER BY total_donated DESC 
    LIMIT 100;
  `;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching top donators:', err);
      return res.status(500).send('Error fetching top donators');
    }
    res.json(results);
  });
});

// Endpoint to get top winners
app.get('/api/top-winners', (req, res) => {
  const sql = `
    SELECT address, username, total_win 
    FROM players 
    WHERE total_win > 0
    ORDER BY total_win DESC 
    LIMIT 100;
  `;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching top winners:', err);
      return res.status(500).send('Error fetching top winners');
    }
    res.json(results);
  });
});

// Endpoint to get total amount donated
app.get('/api/total_donated', (req, res) => {
  const sql = `SELECT total_amount FROM total_donations;`;
  
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching total amount donated:', err);
      return res.status(500).send('Error fetching total amount donated');
    }
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
