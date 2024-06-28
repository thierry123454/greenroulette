import React, { createContext, useState, useCallback } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const initialState = {
    stage: null,
    outcome: null,
    bet: { amount: null, placed: null, choice: null }, // Add bet details
    exchange: null,
    has_visited_bet: false,
    total_red: 0,
    total_black: 0
  };

  const [gameState, setGameState] = useState(initialState);

  const resetGameState = useCallback(() => {
    setGameState(initialState);
  }, []);

  return (
    <GameContext.Provider value={{ gameState, setGameState, resetGameState }}>
      {children}
    </GameContext.Provider>
  );
};
