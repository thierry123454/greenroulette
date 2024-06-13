import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import Roulette from './Roulette';
import styles from './App.module.css'; // Make sure this is correctly imported

function App() {
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    async function init() {
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' }); // Request account access
        setWeb3(new Web3(provider));
      } else {
        console.error('Please install MetaMask!');
      }
    }
    init();
  }, []);

  return (
    <div className={styles.app}>
      {web3 ? <Roulette web3={web3} /> : <p>Please install MetaMask.</p>}
    </div>
  );
}

export default App;
