import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext';
import commonStyles from './CommonStyles.module.css';
import styles from './BettingComponent.module.css';
import { ReactComponent as Logo } from './images/logo.svg';
import io from 'socket.io-client';
import metamaskLogo from'./images/metamask.png';
import rouletteContractAbi from './abis/rouletteContractAbi.json';
import detectEthereumProvider from '@metamask/detect-provider';

const contractAddress = "0x82158f08196Ad57E0fDDa621a5E4Cb6fD2525fE5";

// Initialize socket connection
const socket = io('https://localhost:3001', { secure: true });


function BettingComponent({ web3 }) {
  const [betAmount, setBetAmount] = useState('');
  const [ethAmount, setEthAmount] = useState('');

  const navigate = useNavigate();
  const { gameState, setGameState } = useContext(GameContext);
  const [specialStyle, setSpecialStyle] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // State to track loading
  const [betPlaced, setIsPlaced] = useState(-1); // State to track loading

  const [userAddress, setUserAddress] = useState('');

  const contract = new web3.eth.Contract(rouletteContractAbi, contractAddress);

  // Convert USD amount to ETH
  useEffect(() => {
    if (gameState.exchange && betAmount) {
      const ethEquivalent = parseFloat(betAmount) / gameState.exchange;
      setEthAmount(ethEquivalent.toFixed(4));
    }
  }, [betAmount, gameState.exchange]);

  // Fade-In Animation
  useEffect(() => {
    setIsLoaded(true); // Set to true when component mounts
  }, []);

  // Get account details
  useEffect(() => {
    async function init() {
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' })
          .then(accounts => {
            if (accounts.length > 0) {
              setUserAddress(accounts[0]);
            }
          });
      } else {
        console.error('Please install MetaMask!');
      }
    }
    init();
  }, []);

  // Get account details on change
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
        } else {
          setUserAddress('');
        }
      };
  
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);
  
  // Get game state information
  useEffect(() => {
    const timerHandler = (data) => {
      console.log('Timer data received:', data);
      setGameState(prevState => ({ ...prevState, timer: data.countdown, stage: data.stage, exchange: data.exchange }));

      // Check navigation condition immediately after state update
      if (data.stage != 0) {
        console.log("Navigating to transactions due to stage 1.");
        navigate('/transactions');
      } else {
        setGameState(prevState => ({
          ...prevState,
          has_visited_bet: true
        }));
      }
    };

    // Listen for timer updates from server
    socket.on('timer', timerHandler);

    return () => {
      socket.off('timer', timerHandler);
    };
  }, [setGameState, navigate]); // Removed gameState from the dependency array

  // Change styles according to state
  useEffect(() => {
    if (gameState.timer <= 30 && gameState.timer >= 2) {
      setSpecialStyle(true);
    } else if (gameState.timer <= 1) {
      setIsLoaded(false);
    } else {
      setSpecialStyle(false);
    }

    if (gameState.stage === 1) {
      navigate('/transactions');
    }
  }, [gameState, navigate, isLoaded]);

  const placeBet = async (guess) => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.setBet(guess).send({
        from: accounts[0],
        value: web3.utils.toWei(ethAmount, 'ether')
      });
      setGameState(prevState => ({
        ...prevState,
        bet: { amount: betAmount, placed: true, choice: guess }
      }));
      setIsPlaced(guess);
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  return (
    <div className={`${commonStyles.container} ${isLoaded ? commonStyles.loaded : ''}`}>
      <div>
        <Logo className={commonStyles.logo} />
      </div>
      <div className={commonStyles.content}>
        <div className={`${commonStyles.info} ${styles.info} ${specialStyle ? styles.special : ''}`}>
          <div className={commonStyles.status}>
            <span className={commonStyles.label}>Status</span>
            <div id={styles.betting} className={`${commonStyles.info_text} ${specialStyle ? styles.special : ''}`}>{gameState.timer > 30 ? 'Betting Open' : 'Betting Closing'}</div>
          </div>
          <hr className={commonStyles.line} />
          <div className={commonStyles.timer}>
            <span className={commonStyles.label}>Timer</span>
            <div id={commonStyles.timer} className={commonStyles.info_text}>{gameState.timer}</div>
            <div id={styles.timer_overlay} className={`${commonStyles.info_text} ${specialStyle ? styles.special : ''}`}>{gameState.timer}</div>
          </div>
        </div>
        <div className={styles.betting}>
          <input
            type="text" 
            onChange={e => setBetAmount(e.target.value)} 
            placeholder="Bet Amount in USD" 
            className={styles.betInput}
            disabled={betPlaced != -1}
          />
          <div className={styles.buttons}>
            <button 
              onClick={() => placeBet(0)}
              disabled={betPlaced != -1}
              className={`${styles.button} ${styles.red} ${betPlaced == -1 ? styles.canHoverRed : ''} ${betPlaced == 0 ? styles.selected : ''}`}>
              Red
            </button>
            <button 
              onClick={() => placeBet(1)} 
              disabled={betPlaced != -1} 
              className={`${styles.button} ${styles.black} ${betPlaced == -1 ? styles.canHoverBlack : ''} ${betPlaced == 1 ? styles.selected : ''}`}>
                Black
            </button>
          </div>
          <div className={styles.address}>
            <img src={metamaskLogo} className={styles.mm_logo} alt="MetaMask logo"/>
            {userAddress.substring(0,6) + "..." + userAddress.substring(userAddress.length - 4)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BettingComponent;
