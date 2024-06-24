import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext'; // Ensure this path is correct

function TransactionComponent() {
  const navigate = useNavigate();
  const { gameState } = useContext(GameContext);

  useEffect(() => {
    if (gameState.stage === 3) { // Example stage check, adjust based on your game logic
      navigate('/roulette');
    }
  }, [gameState, navigate]);

  return (
    <div>
      <h2>Processing Transactions...</h2>
      <p>Please wait while we finalize the transactions and fetch the random number.</p>
    </div>
  );
}

export default TransactionComponent;
