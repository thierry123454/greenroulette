// Card.js
import React from 'react';
import styles from './Card.module.css'; // Ensure you have the corresponding CSS module

const Card = ({ logo, alt, description }) => {
  return (
    <div className={`${styles.card} ${styles.black}`}>
      <img src={logo} alt={alt} className={styles.charityLogo} />
      <p>{description}</p>
    </div>
  );
};

export default Card;
