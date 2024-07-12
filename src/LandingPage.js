// LandingPage.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './LandingPage.module.css'; // Import CSS module for styles
import { useNavigate } from 'react-router-dom';
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
  const [animate, setAnimate] = useState(false);

  const navigate = useNavigate();

  const allCharities = [
    { logo: STCLogo, alt: 'Charity Logo', fontSize: '16px', black: true, description: 'Save the Children is passionately committed to one goal: Giving all children the best chance for the future they deserve – a healthy start in life, to be protected from harm and the opportunity to learn. Every day, in times of crisis, here in the U.S. and in more than 110 countries around the world, they do whatever it takes to reach the most vulnerable children and their families. ' },
    { logo: GDLogo, alt: 'Charity Logo', fontSize: '16px', black: false, description: 'GiveDirectly is a nonprofit that lets donors send money directly to the world’s poorest households. In doing so, they aim to accelerate the end of extreme poverty globally. They believe people living in poverty deserve the dignity to choose for themselves how best to improve their lives — cash enables that choice.' },
    { logo: TFTFLogo, alt: 'Charity Logo', fontSize: '13px', black: true, description: 'Around the world, modern and industrialized farming practices are destroying the environment—and, at the same time, failing to provide reliable income and nourishment for the farmers we all depend on to survive. At Trees for the Future (TREES), they recognize that unsustainable land use is the root cause of our most pressing challenges. They confront these challenges by serving the people at the heart of our global food systems: farmers and their families. They provides hands-on, immersive education, skill building, and support, encouraging farmers to work with nature, not against it.' },
    { logo: ODALogo, alt: 'Charity Logo', fontSize: '20px', black: false, description: 'Operating from ship and shore, ODA\'s all-volunteer boat and dive crews remove abandoned fishing nets, traps, lines, plastic, and other man-made debris threatening ocean wildlife and habitats.' },
    { logo: AFWLogo, alt: 'Charity Logo', fontSize: '13px', black: true, description: 'The gift of clean water can mean the end of hours of long walks to and from the swamp for dirty, disease filled water. It means lifting families out of a cycle of poverty, it means removing the barriers that rob girls of the chance to earn an education and it gives a community the chance to thrive. This is what Acts For Water does. They provide clean accessible water to those in desperate need. Acts for Water is one of Canada’s oldest charities who partners with an all local Ugandan team to build the most sustainable water solution in the world.' },
    { logo: PFLogo, alt: 'Charity Logo', fontSize: '18px', black: false, description: 'PathForward’s mission is to transform lives by delivering housing solutions and pathways to stability. PathForward’s vision is an inclusive and equitable community where all neighbors live stable, secure, and independent lives free from the threat of homelessness. ' },
    { logo: ZFLogo, alt: 'Charity Logo', fontSize: '13px', black: true, description: 'Zero Foodprint is changing the way food is grown to restore the climate. They fund carbon farming projects through their Restore grant program. Their values include regeneration, collective action, justice and prosperity. Regeneration is the idea that with regenerative agriculture, we can not only slow but reverse climate change by drawing carbon into the soil and restoring natural ecosystems. Their work provides a renewable economic system giving businesses, and thus their patrons, an easy way to fund climate solutions. ' },
  ];

  const [cards, setCards] = useState(allCharities.slice(0, 4));  // Start with the first four cards
  const toAddRef = useRef(4);
  
  // Ensure updateCards is defined with useCallback
  const updateCards =() => {
    const newCardIndex = toAddRef.current;
    const newCard = allCharities[newCardIndex];
 
    setCards(currentCards => [...currentCards, newCard]);
    setAnimate(true); // Trigger animation

    // Update the current index
    toAddRef.current = (newCardIndex + 1) % allCharities.length;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (animate) {
        setAnimate(false);
        setCards(currentCards => currentCards.slice(1));
      }
    }, 5000);
  
    return () => clearTimeout(timeout);
  }, [animate]);

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
            <button id={styles.startPlaying} onClick={() => {navigate('/getting-started')}}>Start Playing 🚀</button>
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
          <div className={`${styles.cards} ${animate ? styles.goLeftAnimation : ''}`}>
            {cards.map(card => (
              <Card logo={card.logo} alt={card.alt} description={card.description} fontSize={card.fontSize} black={card.black} />
            ))}
          </div>
          <CountdownCircle duration={10000} onReset={updateCards} />
        </div>
        <div className={styles.elements2}>
          <MiddleCoin className={styles.middleCoin2}/>
          <FrontCoin className={styles.frontCoin2}/>
          <Hearts className={styles.hearts2}/>
        </div>
    </div>
    </>
  );
}

export default LandingPage;
