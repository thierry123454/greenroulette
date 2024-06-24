import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext';

function RouletteComponent() {
  const navigate = useNavigate();
  const { gameState } = useContext(GameContext);

  useEffect(() => {
    if (gameState.stage === 3) { // Assuming stage 3 is showing the spinning wheel
      navigate('/outcome');
    }
  }, [gameState, navigate]);

  return (
    <div>
      <h2>Spinning Roulette...</h2>
      <p>The wheel is spinning. Hold tight for the results!</p>
    </div>
  );
}

export default RouletteComponent;
