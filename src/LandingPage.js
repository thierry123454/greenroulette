// LandingPage.js
import React, { useEffect } from 'react';
import styles from './LandingPage.module.css'; // Import CSS module for styles
import commonStyles from './CommonStyles.module.css'; // Import CSS module for styles
import { ReactComponent as Logo } from './images/logo.svg';
import { ReactComponent as BackCoin } from './images/landing_visual/Back_Coin.svg';
import { ReactComponent as Earth } from './images/landing_visual/Earth.svg';
import { ReactComponent as MiddleCoin } from './images/landing_visual/Middle_Coin.svg';
import { ReactComponent as FrontCoin } from './images/landing_visual/Front_Coin.svg';
import { ReactComponent as Hearts } from './images/landing_visual/Hearts.svg';

function LandingPage() {

  return (
    <>
      <div className={styles.page1}>
        <div className={styles.header}>
          <Logo />
          <div className={styles.buttonGroup}>
            <button>Charities 🌍</button>
            <button>Leaderboards 🏆</button>
          </div>
        </div>
        <div className={styles.main}>
          <div className={styles.info}>
            <p className={styles.slogan}>Play for the <span id={styles.distinguish}>Planet</span></p>
            <p className={styles.infoText}>
              Welcome to GreenRoulette, where every spin is a chance to win and 
              an opportunity to help. At GreenRoulette, we believe in entertainment 
              that cares. That's why we commit <b>75%</b> of all profits to support various 
              charities. With <span className={styles.donationAmount}>$12491</span> already donated, join us in our mission to give 
              back. Ready to place your bets?
            </p>
            <button id={styles.startPlaying} onClick={() => {}}>Start Playing 🚀</button>
          </div>
          <div className={styles.visual}>
            <div className={styles.elements}>
                <BackCoin className={styles.backCoin}/>
                <Earth className={styles.earth}/>
                <MiddleCoin className={styles.middleCoin}/>
                <FrontCoin className={styles.frontCoin}/>
                <Hearts className={styles.hearts}/>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.page2}>
        Page 2 content here
      </div>
    </>
  );
}

export default LandingPage;
