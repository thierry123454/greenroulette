import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext'; // Ensure this path is correct
import { ReactComponent as Logo } from './images/logo.svg'
import { ReactComponent as RouletteBack } from './images/roulette_back.svg'
import { ReactComponent as RouletteSpinning } from './images/roulette_spinning.svg'
import commonStyles from './CommonStyles.module.css';
import styles from './TransactionComponent.module.css';
import io from 'socket.io-client';
import JoinLateNotice from './JoinLateNotice';

// Initialize socket connection
const socket = io('https://localhost:3001', { secure: true });

function TransactionComponent() {
  const navigate = useNavigate();
  const { gameState, setGameState } = useContext(GameContext);
  const [specialStyle, setSpecialStyle] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // State to track loading

  useEffect(() => {
    const timerHandler = (data) => {
      console.log('Timer data received:', data);
      setGameState(prevState => ({ ...prevState, timer: data.countdown, stage: data.stage }));
    };

    // Listen for timer updates from server
    socket.on('timer', timerHandler);

    return () => {
      socket.off('timer', timerHandler);
    };
  }, [setGameState, navigate]); // Removed gameState from the dependency array

  useEffect(() => {
    if (gameState.timer > 1 && gameState.stage == 1) {
      setSpecialStyle(false);
    } else {
      setSpecialStyle(true);
    }

    if (gameState.stage == 1 || gameState.stage == 2){ 
      setIsLoaded(true);
    }

    if (gameState.stage === 3) { // Example stage check, adjust based on your game logic
      setIsLoaded(false);
      setTimeout(() => navigate('/roulette'), 1000);
    }
  }, [gameState, navigate]);

  return (
    <div className={`${commonStyles.container} ${isLoaded ? commonStyles.loaded : ''}`}>
      <div>
        <Logo className={commonStyles.logo} />
      </div>
      <div className={commonStyles.content}>
        <div className={`${commonStyles.info} ${styles.info} ${specialStyle ? styles.special : ''}`}>
            <div className={`${commonStyles.status} ${styles.status}`}>
              <span className={commonStyles.label}>Status</span>
              <div id={styles.status_text} className={`${commonStyles.info_text} ${styles.info_text} ${specialStyle ? styles.special : ''}`}>Finalizing Transactions</div>
              <div id={styles.status_text_overlay} className={`${commonStyles.info_text} ${styles.info_text} ${specialStyle ? styles.special : ''}`}>Fetching Random Number</div>
            </div>
            <hr className={commonStyles.line} />
            <div className={`${commonStyles.timer} ${styles.timer}`}>
              <span className={commonStyles.label}>Timer</span>
              <div id={styles.timer} className={`${commonStyles.info_text} ${specialStyle ? styles.special : ''}`}>{gameState.timer}</div>
              <div id={styles.timer_overlay} className={`${commonStyles.info_text} ${specialStyle ? styles.special : ''}`}>±10-90</div>
            </div>
        </div>
        <div id={styles.spinner}>
          <RouletteBack />
          <RouletteSpinning id={styles.spinning} />
        </div>
      </div>
      {!gameState.has_visited_bet && <JoinLateNotice />}
    </div>
  );
}

export default TransactionComponent;
