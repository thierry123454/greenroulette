import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext';
import commonStyles from './CommonStyles.module.css';
import styles from './BettingComponent.module.css';
import { ReactComponent as Logo } from './images/logo.svg';
import io from 'socket.io-client';
import metamaskLogo from'./images/metamask.png';

// Initialize socket connection
const socket = io('https://localhost:3001', { secure: true });

function BettingComponent() {
  const navigate = useNavigate();
  const { gameState, setGameState } = useContext(GameContext);
  const [specialStyle, setSpecialStyle] = useState(false);
  
  useEffect(() => {
    const timerHandler = (data) => {
      console.log('Timer data received:', data);
      setGameState(prevState => ({ ...prevState, timer: data.countdown, stage: data.stage }));

      // Check navigation condition immediately after state update
      if (data.stage === 1) {
        console.log("Navigating to transactions due to stage 1.");
        navigate('/transactions');
      }
    };

    // Listen for timer updates from server
    socket.on('timer', timerHandler);

    return () => {
      socket.off('timer', timerHandler);
    };
  }, [setGameState, navigate]); // Removed gameState from the dependency array

  useEffect(() => {
    if (gameState.timer <= 30) {
      setSpecialStyle(true);
    } else {
      setSpecialStyle(false);
    }

    if (gameState.stage === 1) {
      navigate('/transactions');
    }
  }, [gameState, navigate]);

  return (
    <div className={commonStyles.container}>
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
          <input type="text" placeholder="Bet Amount in ETH" className={styles.betInput} />
          <div className={styles.buttons}>
            <button className={`${styles.button} ${styles.red}`}>Red</button>
            <button className={`${styles.button} ${styles.black}`}>Black</button>
          </div>
          <div className={styles.address}>
            <img src={metamaskLogo} className={styles.mm_logo} alt="MetaMask logo"/>
            0x43Cb...E091
          </div>
        </div>
      </div>
    </div>
  );
}

export default BettingComponent;
