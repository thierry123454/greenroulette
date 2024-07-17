const { Web3 } = require('web3');
const abi_roulette = require('./src/abis/rouletteContractAbi.json');
const infuraUrl = process.env.INFURA_URL;
const rouletteContractAddress = "0x9365F09440f8de261A893BCb1112BB75fc4C342e";
const web3 = new Web3(infuraUrl);
const mysql = require('mysql2/promise');

const rouletteContract = new web3.eth.Contract(abi_roulette, rouletteContractAddress);

async function updateTotalDonations() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASS,
      database: 'GreenRoulette'
    });

    const connection = await pool.getConnection();
    const totalDonated = await rouletteContract.methods.getTotalDonated().call();
    console.log('Total Donated:', totalDonated);

    const sql = `UPDATE total_donations SET total_amount = ?;`;
    const [results] = await connection.query(sql, [totalDonated]);
    console.log('Database Update Results:', results);
    connection.release();

    await pool.end();
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

updateTotalDonations();
