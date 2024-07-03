import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext'; // Ensure this path is correct
import { ReactComponent as Logo } from './images/logo.svg'
import { ReactComponent as Zero } from './images/0.svg'
import { ReactComponent as Black } from './images/black.svg'
import { ReactComponent as Red } from './images/red.svg'
import { ReactComponent as Arrow } from './images/arrow.svg'
import commonStyles from './CommonStyles.module.css';
import styles from './RouletteComponent.module.css';
import io from 'socket.io-client';
import JoinLateNotice from './JoinLateNotice';

// Define the roulette numbers and their colors
const rouletteNumbers = "3-26-0-32-15-19-4-21-2-25-17-34-6-27-13-36-11-30-8-23-10-5-24-16-33-1-20-14-31-9-22-18-29-7-28-12-35".split('-');
const redNumbers = new Set([32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3]);
const blackNumbers = new Set([15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26]);
const adjustedNumbers = "0-32-15-19-4-21-2-25-17-34-6-27-13-36-11-30-8-23-10-5-24-16-33-1-20-14-31-9-22-18-29-7-28-12-35-3-26".split('-');

// Initialize socket connection
const socket = io('https://localhost:3001', { secure: true });

const calculateTransform = (winningNumber) => {
  const baseTranslation = -9842 - 45; // Base translation for two full rotations
  const findWinning = (element) => element == winningNumber;
  const winningIndex = adjustedNumbers.findIndex(findWinning);
  const additionalTranslation = winningIndex * -133; // Each tile's width, change the number based on your actual tile width
  return baseTranslation + additionalTranslation;
};

function RouletteComponent() {
  const navigate = useNavigate();
  const { gameState, setGameState } = useContext(GameContext);
  const [isLoaded, setIsLoaded] = useState(false); // State to track loading
  const [transformX, setTransformX] = useState(-45);

  useEffect(() => {
    setIsLoaded(true); // Set to true when component mounts
  }, []);

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
    if (gameState.timer >= 21) { // Starting the spinning
      const newTransformX = calculateTransform(gameState.outcome);
      setTransformX(newTransformX);
    } else if (gameState.timer <= 21 && gameState.timer > 19) {
      setIsLoaded(false);
    } else if (gameState.timer <= 19) {
      navigate('/outcome');
    }

  }, [gameState, navigate]);

  useEffect(() => {
    setTimeout(() => {
      setRouletteStyle(prevStyle => ({ ...prevStyle, left: `${transformX}px` }));
    }, 1000); // Trigger after a short delay
  }, [transformX]);
  
  const [rouletteStyle, setRouletteStyle] = useState({
    transition: 'left 23s ease-in-out',
    left: '-45px' // Start position
  });

  return (
    <div className={`${commonStyles.container} ${isLoaded ? commonStyles.loaded : ''}`}>
      <div>
        <Logo className={commonStyles.logo} />
      </div>
      <div className={`${commonStyles.content} ${styles.content}`}>
        <Arrow id={styles.arrow} />
        <div className={styles.rouletteContainer} style={rouletteStyle}>
          {rouletteNumbers.concat(rouletteNumbers).concat(rouletteNumbers).concat(rouletteNumbers).map((number, index) => {
            let TileComponent = number === '0' ? Zero : redNumbers.has(parseInt(number)) ? Red : Black;
            return (
              <div key={index} className={styles.tile}>
                <TileComponent />
                <span id={`${TileComponent == Zero ? styles.zero : redNumbers.has(parseInt(number)) ? styles.red : styles.black}`} className={styles.numberLabel}>{number}</span>
              </div>
            );
          })}
        </div>
      </div>
      {!gameState.has_visited_bet && <JoinLateNotice />}
    </div>
  );
}

export default RouletteComponent;