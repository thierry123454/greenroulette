// LandingPage.js
import React, { useEffect, useState } from 'react';
import styles from './LandingPage.module.css'; // Import CSS module for styles
import commonStyles from './CommonStyles.module.css'; // Import CSS module for styles
import { ReactComponent as Logo } from './images/logo.svg';
import { ReactComponent as BackCoin } from './images/landing_visual/Back_Coin.svg';
import { ReactComponent as Earth } from './images/landing_visual/Earth.svg';
import { ReactComponent as MiddleCoin } from './images/landing_visual/Middle_Coin.svg';
import { ReactComponent as FrontCoin } from './images/landing_visual/Front_Coin.svg';
import { ReactComponent as Hearts } from './images/landing_visual/Hearts.svg';

import GDLogo from './images/givedirectly_logo.png';
import STCLogo from './images/save_the_children_logo.png';
import ODALogo from './images/oda_logo.png';
import PFLogo from './images/pathforward_logo.png';
import TFTFLogo from './images/trees_for_the_future_logo.png';
import ZFLogo from './images/zerofoodprint_logo.jpeg';
import AFWLogo from './images/acts_for_water_logo.png';

import Card from './Card';

import CountdownCircle from './CountdownCircle';

function LandingPage() {

  const [cards, setCards] = useState([
    { logo: STCLogo, alt: 'Charity Logo', description: 'Save the Children is passionately committed to one goal: Giving all children the best chance for the future they deserve – a healthy start in life, to be protected from harm and the opportunity to learn. Every day, in times of crisis, here in the U.S. and in more than 110 countries around the world, they do whatever it takes to reach the most vulnerable children and their families.' },
    { logo: GDLogo, alt: 'Charity Logo', description: 'Save the Children is passionately committed to one goal: Giving all children the best chance for the future they deserve – a healthy start in life, to be protected from harm and the opportunity to learn. Every day, in times of crisis, here in the U.S. and in more than 110 countries around the world, they do whatever it takes to reach the most vulnerable children and their families.' },
    { logo: GDLogo, alt: 'Charity Logo', description: 'Save the Children is passionately committed to one goal: Giving all children the best chance for the future they deserve – a healthy start in life, to be protected from harm and the opportunity to learn. Every day, in times of crisis, here in the U.S. and in more than 110 countries around the world, they do whatever it takes to reach the most vulnerable children and their families.' },
    { logo: AFWLogo, alt: 'Charity Logo', description: 'Save the Children is passionately committed to one goal: Giving all children the best chance for the future they deserve – a healthy start in life, to be protected from harm and the opportunity to learn. Every day, in times of crisis, here in the U.S. and in more than 110 countries around the world, they do whatever it takes to reach the most vulnerable children and their families.' },
    // { logo: AFWLogo, alt: 'Charity Logo', description: 'Save the Children is passionately committed to one goal: Giving all children the best chance for the future they deserve – a healthy start in life, to be protected from harm and the opportunity to learn. Every day, in times of crisis, here in the U.S. and in more than 110 countries around the world, they do whatever it takes to reach the most vulnerable children and their families.' },
  ]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateCards();
    }, 30000); // Every 32 seconds, update cards

    return () => clearInterval(intervalId);
  }, [cards]);

  const updateCards = () => {
    // Implement logic to update cards here
    // Example: shift left and push new card on the right
    const newCard = { id: Date.now(), logo: ODALogo, alt: 'New Charity Logo', description: 'New charity description...' };
    setCards(currentCards => [...currentCards.slice(1), newCard]); // Remove the first card and add a new one
  };

  return (
    <>
      <div className={styles.page1}>
        <div className={styles.header}>
          <Logo />
          <div className={styles.buttonGroup}>
            <button className={styles.button}>Charities 🌍</button>
            <button className={styles.button}>Leaderboards 🏆</button>
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
        <h1 className={styles.charityHeader}>See who the community of GreenRoulette is supporting</h1>
        <div className={styles.cardContainer}>
          <div className={styles.cards}>
            {cards.map(card => (
              <Card logo={card.logo} alt={card.alt} description={card.description} />
            ))}
          </div>
          <CountdownCircle duration={10000} />
        </div>
    </div>
    </>
  );
}

export default LandingPage;
