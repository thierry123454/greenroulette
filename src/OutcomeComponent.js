import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext';
import commonStyles from './CommonStyles.module.css';
import styles from './OutcomeComponent.module.css';
import io from 'socket.io-client';

// Initialize socket connection
const socket = io('https://localhost:3001', { secure: true });

const redNumbers = new Set([32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3]);
const blackNumbers = new Set([15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26]);

function TransactionComponent() {
  const navigate = useNavigate();
  const { gameState, setGameState } = useContext(GameContext);
  const [isLoaded, setIsLoaded] = useState(false); // State to track loading

  useEffect(() => {
    setIsLoaded(true); // Set to true when component mounts
  }, []);

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
    if (gameState.timer <= 0) {
      setIsLoaded(false);
    }

    if (gameState.stage == 0) {
      navigate('/')
    }
  }, [gameState, navigate]);

  // Example outcome logic
  const determineOutcome = () => {
    if (!gameState.bet.placed) return 2;
    const number = parseInt(gameState.outcome);
    const isRed = redNumbers.has(number);
    const isBlack = blackNumbers.has(number);
  
    // Check if the choice corresponds to the outcome's color
    if ((gameState.bet.choice === 0 && isRed) || (gameState.bet.choice === 1 && isBlack)) {
      return 0; // Win
    } else {
      return 1; // Loss
    }
  };

  const outcome = determineOutcome();

  return (
    <div className={`${commonStyles.container} ${isLoaded ? commonStyles.loaded : ''}`}>
      <div className={`${commonStyles.content} ${styles.content}`}>
        <h1 id={styles.header} className={`${outcome == 0 ? styles.bright : styles.sad}`}>
          {outcome == 0 ? "CONGRATULATIONS!" : (outcome == 1 ? "TRY AGAIN!" : "NO BET DETECTED!")}
        </h1>
        <span id={styles.consolidation}>{outcome == 1 ? "Don't be sad however..." : ""}</span>
        <div className={`${commonStyles.info} ${styles.info}`}>
            <div className={`${commonStyles.status} ${styles.wonInfo}`}>
              <h2 className={styles.title}>
                {outcome == 0 ? "You Won🏆" : (outcome == 1 ? "You Donated🌳*" : "Others Won🏆")}
              </h2>
              <span className={styles.amount}>{outcome == 0 ? '' + gameState.bet.amount + '$' : (outcome == 1 ? "-$" : "-$")}</span>
            </div>
            <hr className={commonStyles.line} />
            <div className={`${commonStyles.timer} ${styles.donatedInfo}`}>
              <h2 className={styles.title}>Total Donated This Round🌍*</h2>
              <span className={styles.amount}>-$</span>
              <span id={styles.subtext}>* Actual donation amount may be less if future bets decrease pool size.</span>
            </div>
        </div>
        <span id={styles.timer}>Next Round: {gameState.timer}</span>
      </div>
    </div>
  );
}

export default TransactionComponent;
