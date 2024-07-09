import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BettingComponent from './BettingComponent';
import TransactionComponent from './TransactionComponent';
import RouletteComponent from './RouletteComponent';
import OutcomeComponent from './OutcomeComponent';
import LandingPage from './LandingPage'; // Import the new component
import Chat from './Chat'; // Import the chat component
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

function App() {
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false); // State to control chat visibility

  useEffect(() => {
    async function init() {
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        setWeb3(new Web3(provider));
        setLoading(false);
      } else {
        console.error('Please install MetaMask!');
      }
    }
    init();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
        <Chat setIsChatOpen={setIsChatOpen} isChatOpen={isChatOpen} />
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Set LandingPage as the default */}
          <Route path="/betting" element={<BettingComponent web3={web3} setIsChatOpen={setIsChatOpen} isChatOpen={isChatOpen}/>} />
          <Route path="/transactions" element={<TransactionComponent />} />
          <Route path="/roulette" element={<RouletteComponent />} />
          <Route path="/outcome" element={<OutcomeComponent />} />
        </Routes>
    </Router>
  );
}

export default App;
