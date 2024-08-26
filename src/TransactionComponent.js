import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext'; // Ensure this path is correct
import Logo from './Logo'; // Import the new Logo component
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
  const [finishStatus, setfinishStatus] = useState(false);

  const onBackButtonEvent = (e) => {
    e.preventDefault();
    if (!finishStatus) {
        if (window.confirm("You have a bet placed. Are you sure you want to leave?")) {
            setfinishStatus(true)
            // your logic
            navigate('/');
        } else {
            window.history.pushState(null, null, window.location.pathname);
            setfinishStatus(false)
        }
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (gameState.bet.placed) {
        event.preventDefault(); // This is necessary to trigger the dialog
        event.returnValue = ''; // Modern browsers require returnValue to be set
      }
    };

    const handleBeforeRouteChange = () => {
      if (gameState.bet.placed) {
        const confirmationMessage = 'You have a bet placed. Are you sure you want to leave?';
        return window.confirm(confirmationMessage);
      }
      return true;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // If you use React Router, add a listener for route changes
    if (typeof window !== 'undefined') {
      window.onpopstate = handleBeforeRouteChange;
    }

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', onBackButtonEvent);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', onBackButtonEvent);  
      if (typeof window !== 'undefined') {
        window.onpopstate = null;
      }
    };
  }, [gameState.bet.placed]);

  useEffect(() => {
    const timerHandler = (data) => {
      console.log('Timer data received:', data);
      setGameState(prevState => ({ ...prevState, timer: data.countdown, stage: data.stage, exchange: data.exchange, total_red: data.total_red, total_black: data.total_black }));
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
        <Logo />
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
