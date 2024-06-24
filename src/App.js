import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BettingComponent from './BettingComponent';
import TransactionComponent from './TransactionComponent';
import RouletteComponent from './RouletteComponent';
import OutcomeComponent from './OutcomeComponent';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BettingComponent />} />
        <Route path="/transactions" element={<TransactionComponent />} />
        <Route path="/roulette" element={<RouletteComponent />} />
        <Route path="/outcome" element={<OutcomeComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
