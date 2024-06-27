import React, { createContext, useState } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    stage: null,
    outcome: null,
    bet: { amount: null, placed: null, choice: null }, // Add bet details
    exchange: null,
    has_visited_bet: false
  });

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
};
