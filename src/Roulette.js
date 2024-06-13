/* global BigInt */

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';  // Import Web3 if not available globally
import rouletteContractAbi from './abis/rouletteContractAbi.json';
import abi_random from './abis/randomContractAbi.json';  // Ensure this ABI is correctly configured for your contract
import styles from './Roulette.module.css';

const contractAddress = "0x0221344DA85B09fD275Fb13b513961b048C8B149";
const flareRpcUrl = 'https://flare.solidifi.app/ext/C/rpc';
const provider_flare = new Web3(flareRpcUrl);
const randomContractAddress = "0x1000000000000000000000000000000000000003";

function Roulette({ web3 }) {
  const [betAmount, setBetAmount] = useState('');
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [randomNumber, setRandomNumber] = useState(null);

  const contract = new web3.eth.Contract(rouletteContractAbi, contractAddress);
  const randomContract = new provider_flare.eth.Contract(abi_random, randomContractAddress);

  useEffect(() => {
    fetchRandomNumber();
  }, []);

  const fetchRandomNumber = async () => {
    try {
      let randomBigNumber = await randomContract.methods.getCurrentRandom().call();
      console.log(randomBigNumber)
      let randomNumber = randomBigNumber % BigInt(37);  // Keep the operation in BigInt
      setRandomNumber(Number(randomNumber));  // Convert to Number only after reducing the size
    } catch (error) {
      console.error('Failed to fetch random number:', error);
    }
  };

  const placeBet = async () => {
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
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={betAmount}
          onChange={e => setBetAmount(e.target.value)}
          placeholder="Bet Amount in ETH"
          className={styles.input}
        />
        <input
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Your Guess"
          className={styles.input}
        />
      </div>
      <button onClick={placeBet} className={styles.button}>Place Bet</button>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default Roulette;
