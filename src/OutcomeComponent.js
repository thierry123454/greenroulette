import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext';

function OutcomeComponent() {
  const navigate = useNavigate();
  const { gameState } = useContext(GameContext);

  useEffect(() => {
    if (gameState.stage === 4) { // Assuming stage 4 is displaying the outcome
      // Additional logic to restart the game or exit can go here
    }
  }, [gameState, navigate]);

  return (
    <div>
      <h2>Game Outcome</h2>
      <p>Winning outcome: {gameState.outcome}</p>
      <button onClick={() => navigate('/')}>Play Again</button>
    </div>
  );
}

export default OutcomeComponent;
