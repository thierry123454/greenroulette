const https = require('https');
const fs = require('fs');
const express = require('express');
const socketIo = require('socket.io');
const { Web3 } = require('web3');

// Load ABIs
const abi_random = require('./randomContractAbi.json');
const abi_roulette = require('./src/abis/rouletteContractAbi.json');

// Define the sets of numbers for each color
const redNumbers = new Set([32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3]);
const blackNumbers = new Set([15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26]);

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

// Roulette Contract
const infuraUrl = process.env.INFURA_URL;
const privateKey = process.env.PRIVATE_KEY_HOUSE;
const rouletteContractAddress = "0x82158f08196Ad57E0fDDa621a5E4Cb6fD2525fE5";

// Random Number Contract
const flareRpcUrl = 'https://flare.solidifi.app/ext/C/rpc';
const provider_flare = new Web3(flareRpcUrl);
const randomContractAddress = "0x1000000000000000000000000000000000000003";

const web3 = new Web3(infuraUrl);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
const randomContract = new provider_flare.eth.Contract(abi_random, randomContractAddress);
const rouletteContract = new web3.eth.Contract(abi_roulette, rouletteContractAddress);

let stageOneTimer = 100;
let secondaryTimer = 125;
let stageThreeTimer = 50;

let lastRandomNumber = null;
let stage = 0; // Stage control: 0 - Initial, 1 - Waiting for Closure, 2 - Waiting for RN, 3 - Payout and Reopen
let outcome = -1;

function startStageOne() {
  const countdown = setInterval(() => {
    if (stageOneTimer <= 0) {
      console.log("Stage 1 ended.");
      clearInterval(countdown);
      stage = 1;
      return;
    }
    stageOneTimer--;
    console.log("Stage 1:", stageOneTimer);
    io.emit('timer', { countdown: stageOneTimer, stage: 0 });
  }, 1000);
}

function checkBettingClosed() {
  console.log("Checking if betting is closing.");
  // This creates a subscription to listen for the BettingClosed event

  const bettingClosedCheck = setInterval(() => {
    rouletteContract.events.BettingClosed({
      fromBlock: 'latest'
    })
    .on('data', event => {
      console.log("Event received. Betting closes in 2 minutes!");

      // Reset and start the secondary timer upon receiving the event
      clearInterval(bettingClosedCheck);
      secondaryTimer = 125;
      startSecondaryTimer();
      return;
    })
  }, 5000);
}

function startSecondaryTimer() {
  const secondaryCountdown = setInterval(() => {
    if (stage == 1) {
      if (secondaryTimer <= 0) {
        console.log("Stage is 1 and betting has closed. Fetching RN.")
        clearInterval(secondaryCountdown);
        lastRandomNumber = null;
        fetchRandomNumberUntilChange();
        stage = 2;
        return;
      }
      io.emit('timer', { countdown: secondaryTimer, stage: 1 });
    }
    secondaryTimer--;
  }, 1000);
}

async function fetchRandomNumberUntilChange() {
  try {
    const currentRandomNumber = await fetchRandomNumber();
    console.log("Last random number:", lastRandomNumber)
    console.log("Current random number:", currentRandomNumber)
    if (lastRandomNumber === null || lastRandomNumber == currentRandomNumber) {
      lastRandomNumber = currentRandomNumber;
      setTimeout(fetchRandomNumberUntilChange, 5000); // Fetch every 5 seconds
    } else {
      // Numbers have changed, proceed to stage 3
      prepareForPayout(currentRandomNumber);
    }
    io.emit('timer', { countdown: -1, stage: 2 });
  } catch (error) {
    console.error('Error fetching random number:', error);
  }
}

// The function to fetch a random number and convert it to 0 or 1 based on its color
function convertRandomNumber(randomNumber) {
  // Convert the random number to 0 (red) or 1 (black)
  if (redNumbers.has(randomNumber)) {
    return 0; // Red
  } else if (blackNumbers.has(randomNumber)) {
    return 1; // Black
  } else {
    return 2;
  }
}

async function prepareForPayout(randomNumber) {
  stageThreeTimer = 50; // Reset stage one timer
  stage = 3;
  outcome = convertRandomNumber(randomNumber);
  payoutWinners(outcome);
  openBettingAtFourty(); // Open betting 40 seconds into stage 3

  const countdown = setInterval(() => {
    if (stageThreeTimer <= 0) {
      console.log("Stage 3 ended.");
      clearInterval(countdown);
      stage = 0;
      stageOneTimer = 100;
      startStageOne(); // Restart stage one
      outcome = -1;
      return;
    }
    stageThreeTimer--;
    console.log("Stage 3:", stageThreeTimer);
    io.emit('timer', { countdown: stageThreeTimer, stage: 3, game_outcome: outcome });
  }, 1000);
}

async function openBettingAtFourty() {
  setTimeout(openBetting, 40000);
}

async function openBetting() {
  try {
    const tx = await rouletteContract.methods.openBetting().send({ from: account.address });
    console.log('Betting opened:', tx);
    checkBettingClosed();
  } catch (error) {
    console.error('Failed to open betting:', error);
  }
}

async function payoutWinners(outcome) {
  try {
    const tx = await rouletteContract.methods.payoutWinners(outcome).send({ from: account.address });
    console.log('Winners paid out:', tx);
  } catch (error) {
    console.error('Failed to pay out winners:', error);
  }
}

async function fetchRandomNumber() {
  const randomBigNumber = await randomContract.methods.getCurrentRandom().call();
  const randomNumber = Number(randomBigNumber % BigInt(37));
  return randomNumber;
}

// Start the initial stage as soon as the server starts
startStageOne();
checkBettingClosed();

// Handling a new connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  if (stage == 0) {
    io.emit('timer', { countdown: stageOneTimer, stage: 0 });
  } else if (stage == 1) {
    io.emit('timer', { countdown: secondaryTimer, stage: 1 });
  } else if (stage == 2) {
    io.emit('timer', { countdown: -1, stage: 2 });
  } else {
    io.emit('timer', { countdown: stageThreeTimer, stage: 3, game_outcome: outcome });
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve the app
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
