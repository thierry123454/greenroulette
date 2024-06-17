/* global BigInt */

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import socketIoClient from 'socket.io-client';
import rouletteContractAbi from './abis/rouletteContractAbi.json';
import abi_random from './abis/randomContractAbi.json';
import styles from './Roulette.module.css';

const contractAddress = "0xBD0A95d64DF1FD7d1B61707757dc446063375bf7";
const flareRpcUrl = 'https://flare.solidifi.app/ext/C/rpc';
const provider_flare = new Web3(flareRpcUrl);
const randomContractAddress = "0x1000000000000000000000000000000000000003";
const SOCKET_SERVER_URL = "https://localhost:3001";

function Roulette({ web3 }) {
  const [betAmount, setBetAmount] = useState('');
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [randomNumber, setRandomNumber] = useState(null);
  const [timer, setTimer] = useState(null);
  const [displayTimer, setDisplayTimer] = useState(null);
  const [fetchedAt20, setFetchedAt20] = useState(false);
  const [fetchedBetween120And20, setFetchedBetween120And20] = useState(false);

  const contract = new web3.eth.Contract(rouletteContractAbi, contractAddress);
  const randomContract = new provider_flare.eth.Contract(abi_random, randomContractAddress);
  
  useEffect(() => {
    const socket = socketIoClient(SOCKET_SERVER_URL);
    socket.on('timer', (data) => {
      setTimer(data.countdown);
      updateDisplayTimer(data.countdown);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    // console.log(timer);
    // console.log("fetched at 120:", fetchedBetween120And20);
    // console.log("fetched at 20:", fetchedAt20);

    if (timer <= 20) {
      if (!fetchedAt20) {
        fetchRandomNumber();
        setFetchedAt20(true);
      }

      setMessage('Winner determined. Waiting for the next round to start.');
    } else if (timer <= 140 && timer > 20) {
      if (timer <= 120 && !fetchedBetween120And20) {
        fetchRandomNumber();
        setFetchedBetween120And20(true);
      }

      setMessage('Betting is closed. Finalizing transactions and determining game output.');
    } else if (timer <= 240 && timer > 120) {
      setMessage('Betting is open.');
      setFetchedAt20(false);
      setFetchedBetween120And20(false);
    } else {
      setMessage('');
    }
  }, [timer]);

  const fetchRandomNumber = async () => {
    try {
      let randomBigNumber = await randomContract.methods.getCurrentRandom().call();
      let randomNumber = randomBigNumber % BigInt(37); // Keep the operation in BigInt
      setRandomNumber(Number(randomNumber)); // Convert to Number only after reducing the size
      console.log("Random number fetched at: ", timer);
    } catch (error) {
      console.error('Failed to fetch random number:', error);
    }
  };

  const updateDisplayTimer = (timer) => {
    if (timer > 140) {
      setDisplayTimer(timer - 140);
    } else if (timer > 20) {
      setDisplayTimer(timer - 20);
    } else {
      setDisplayTimer(timer);
    }
  };

  const placeBet = async () => {
    if (timer > 140) { // Ensure bets are placed only during the open betting period
      console.error("Betting is currently closed.");
      setMessage("Betting is currently closed.");
      return;
    }
    try {
      const accounts = await web3.eth.getAccounts();
      const tx = await contract.methods.setBet(guess).send({
        from: accounts[0],
        value: web3.utils.toWei(betAmount, 'ether')
      });
      setMessage('Bet placed successfully!');
    } catch (error) {
      console.error('Error placing bet:', error);
      setMessage('Error placing bet. See console for details.');
    }
  };

  return (
    <div className={styles.roulette}>
      <h1 className={styles.title}>GreenRoulette</h1>
      {randomNumber !== null && <p>Current Random Number: {randomNumber}</p>}
      {timer !== null && <p>Timer: {displayTimer} seconds</p>}
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={betAmount}
          onChange={e => setBetAmount(e.target.value)}
          placeholder="Bet Amount in ETH"
          className={styles.input}
          disabled={timer <= 140}
        />
        <input
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Your Guess"
          className={styles.input}
          disabled={timer <= 140}
        />
      </div>
      <button onClick={placeBet} className={styles.button} disabled={timer <= 140}>Place Bet</button>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default Roulette;
