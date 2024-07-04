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

const contractAddress = "0x2DF14FAF7E0a1E1dc49eAaB612EFFcF19aCB5CFe";

// Initialize socket connection
const socket = io('https://localhost:3001', { secure: true });


function BettingComponent({ web3, isChatOpen, setIsChatOpen }) {
  const [betAmount, setBetAmount] = useState('');
  const [ethAmount, setEthAmount] = useState('');

  const navigate = useNavigate();
  const { gameState, setGameState, resetGameState } = useContext(GameContext);
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

  // Reset game state when component mounts
  useEffect(() => {
    resetGameState(); // Reset game state on component mount

    // Additional logic to set up or fetch initial data if necessary
  }, [resetGameState]);

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
              setGameState(prevState => ({
                ...prevState,
                userAddress: accounts[0]
              }));
            }
          });
      } else {
        console.error('Please install MetaMask!');
      }
    }
    init();
  }, [setGameState]);

  // Get account details on change
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setGameState(prevState => ({
            ...prevState,
            userAddress: accounts[0]
          }));
        } else {
          setUserAddress('');
          setGameState(prevState => ({
            ...prevState,
            userAddress: ''
          }));
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
      setGameState(prevState => ({ ...prevState, timer: data.countdown, stage: data.stage, exchange: data.exchange, total_red: data.total_red, total_black: data.total_black }));

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
        bet: { amount: ethAmount, placed: true, choice: guess }
      }));
      setIsPlaced(guess);
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className={`${commonStyles.container} ${isLoaded ? commonStyles.loaded : ''}`}>
      <div>
        <Logo className={commonStyles.logo} />
      </div>
      <button onClick={toggleChat} className={`${styles.openChatBtn} ${isChatOpen ? styles.hidden : ''}`}>
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_45_16)">
          <path d="M6.50017 11C10.0908 11 13.0002 8.5375 13.0002 5.5C13.0002 2.4625 10.0908 0 6.50017 0C2.90955 0 0.000174167 2.4625 0.000174167 5.5C0.000174167 6.70625 0.459549 7.82187 1.23767 8.73125C1.1283 9.025 0.965799 9.28438 0.793924 9.50313C0.643924 9.69688 0.490799 9.84687 0.378299 9.95C0.322049 10 0.275174 10.0406 0.243924 10.0656C0.228299 10.0781 0.215799 10.0875 0.209549 10.0906L0.203299 10.0969C0.0314242 10.225 -0.0435758 10.45 0.0251742 10.6531C0.0939242 10.8562 0.284549 11 0.500174 11C1.18142 11 1.86892 10.825 2.4408 10.6094C2.7283 10.5 2.99705 10.3781 3.23142 10.2531C4.1908 10.7281 5.30642 11 6.50017 11ZM14.0002 5.5C14.0002 9.00938 10.9033 11.6531 7.23455 11.9688C7.99392 14.2938 10.5127 16 13.5002 16C14.6939 16 15.8095 15.7281 16.772 15.2531C17.0064 15.3781 17.272 15.5 17.5595 15.6094C18.1314 15.825 18.8189 16 19.5002 16C19.7158 16 19.9095 15.8594 19.9752 15.6531C20.0408 15.4469 19.9689 15.2219 19.7939 15.0938L19.7877 15.0875C19.7814 15.0812 19.7689 15.075 19.7533 15.0625C19.722 15.0375 19.6752 15 19.6189 14.9469C19.5064 14.8437 19.3533 14.6937 19.2033 14.5C19.0314 14.2812 18.8689 14.0187 18.7595 13.7281C19.5377 12.8219 19.997 11.7062 19.997 10.4969C19.997 7.59687 17.3439 5.21875 13.9783 5.0125C13.9908 5.17187 13.997 5.33437 13.997 5.49687L14.0002 5.5Z" fill="url(#paint0_linear_45_16)"/>
          </g>
          <defs>
          <linearGradient id="paint0_linear_45_16" x1="9.99949" y1="0" x2="9.99949" y2="16" gradientUnits="userSpaceOnUse">
          <stop stop-color="#00A4D8"/>
          <stop offset="1" stop-color="#B8E3A9"/>
          </linearGradient>
          <clipPath id="clip0_45_16">
          <rect width="20" height="16" fill="white"/>
          </clipPath>
          </defs>
        </svg>
      </button>
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
