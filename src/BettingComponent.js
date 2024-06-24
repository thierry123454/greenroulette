import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from './GameContext';
import styles from './BettingComponent.module.css'; // Ensure you have this CSS file
import { ReactComponent as Logo } from './images/logo.svg';
import metamaskLogo from'./images/metamask.png';

function BettingComponent() {
  const navigate = useNavigate();
  const { gameState } = useContext(GameContext);

  useEffect(() => {
    if (gameState.stage === 2) {
      navigate('/transactions');
    }
  }, [gameState, navigate]);

  return (
    <div className={styles.container}>
      <div>
        <Logo className={styles.logo} />
      </div>
      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.status}>
            <span className={styles.label}>Status</span>
            <div id={styles.betting} className={styles.info_text}>{gameState.open ? 'Betting Open' : 'Betting Closed'}</div>
          </div>
          <hr className={styles.line} />
          <div className={styles.timer}>
            <span className={styles.label}>Timer</span>
            <div id={styles.timer} className={styles.info_text}>{gameState.timer}90</div>
          </div>
        </div>
        <div className={styles.betting}>
          <input type="text" placeholder="Bet Amount in ETH" className={styles.betInput} />
          <div className={styles.buttons}>
            <button className={`${styles.button} ${styles.red}`}>Red</button>
            <button className={`${styles.button} ${styles.black}`}>Black</button>
          </div>
          <div className={styles.address}>
            <img src={metamaskLogo} className={styles.mm_logo} alt="MetaMask logo"/>
            0x43Cb...E091
          </div>
        </div>
      </div>
    </div>
  );
}

export default BettingComponent;
