import React, { createContext, useState, useCallback } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const initialState = {
    stage: null,
    outcome: null,
    bet: { amount: null, placed: null, choice: null },
    exchange: 1,
    has_visited_bet: false,
    total_red: 0,
    total_black: 0,
    userAddress: null,
  };

  const [gameState, setGameState] = useState(initialState);

  const resetGameState = useCallback(() => {
    setGameState((prevState) => ({
      ...initialState,
      userAddress: prevState.userAddress,  // Preserve the userAddress
    }));
  }, []);

  return (
    <GameContext.Provider value={{ gameState, setGameState, resetGameState }}>
      {children}
    </GameContext.Provider>
  );
};
