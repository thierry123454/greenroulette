// Logo.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as LogoSvg } from './images/logo.svg';
import commonStyles from './CommonStyles.module.css'; // Your common styles

const Logo = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/'); // Navigate to the landing page (assuming '/' is the route for it)
  };

  return (
    <LogoSvg 
      className={commonStyles.logo} 
      onClick={handleLogoClick} 
      style={{ cursor: 'pointer' }} // Ensure the cursor changes to a pointer to indicate a clickable element
    />
  );
};

export default Logo;
