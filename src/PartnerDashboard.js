// PartnerDashboard.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './BecomePartner.module.css'; // Import CSS module for styles
import commonStyles from './CommonStyles.module.css'; // Import CSS module for styles
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Logo } from './images/logo.svg';
import { ReactComponent as Mail } from './images/mail.svg';
import rouletteContractAbi from './abis/rouletteContractAbi.json';
import axios from 'axios';
import Web3 from 'web3';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import ethereumLogo from './images/ethereum_logo.png';
import xLogo from './images/x_logo.png';

const contractAddress = "0xDE498a87437214F6862A1f4B46D05817799eBd48";

// Create an instance of axios with a base URL
const database_api = axios.create({
  baseURL: 'http://localhost:6969/'
});

ChartJS.register(ArcElement, Tooltip, Legend);

function PartnerSharePieChart({ userShare, userAddress }) {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    database_api.get('/api/get_all_partners')
      .then(response => {
        setPartners(response.data.partners.filter(partner => partner.address.toLowerCase() !== userAddress.toLowerCase()));
      })
      .catch(error => console.error('Error fetching partners:', error));
  }, [userAddress]);

  const data = {
    labels: ['You', ...partners.map(partner => partner.address.slice(0, 6) + '...' + partner.address.slice(-4))],
    datasets: [
      {
        data: [userShare, ...partners.map(partner => partner.contribution)],
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          if (context.dataIndex === 0) {
            // Gradient for 'Your Share'
            const gradient1 = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient1.addColorStop(0, '#FF7676');
            gradient1.addColorStop(1, '#FFCF54');
            return gradient1;
          } else {
            // Gradient for 'Other Partners'
            const gradient2 = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient2.addColorStop(0, '#171717');
            gradient2.addColorStop(1, '#D0D0D0');
            return gradient2;
          }
        },
        hoverBackgroundColor: ['#FFCF54', ...Array(partners.length).fill('#171717')],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const total = dataset.data.reduce((acc, current) => acc + current, 0);
          const currentValue = dataset.data[tooltipItem.index];
          const percentage = ((currentValue / total) * 100).toFixed(2);
          return `${data.labels[tooltipItem.index]}: ${currentValue} ETH (${percentage}%)`;
        }
      }
    }
  };
  
  return <Pie data={data} options={options} />;
}

function PartnerDashboard() {
  const navigate = useNavigate();
  const [userShare, setUserShare] = useState(0);
  const [sharePercentage, setSharePercentage] = useState(0);
  const [estimatedMonthlyEarnings, setEstimatedMonthlyEarnings] = useState(0);
  const [contract, setContract] = useState(null);
  const [poolSize, setPoolSize] = useState('0');
  const [isPartner, setIsPartner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [web3, setWeb3] = useState(null);
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      console.log("Web3 set");
      setWeb3(web3Instance);
    }
  }, []);

  useEffect(() => {
    if (web3) {
      const newContract = new web3.eth.Contract(rouletteContractAbi, contractAddress);
      setContract(newContract);
      console.log("Contract set");
    }
  }, [web3]);

  const fetchUserData = useCallback(async (account, userContribution) => {
    if (contract && web3) {
      try {
        const [poolSizeWEI, totalContributions] = await Promise.all([
          contract.methods.viewPool().call(),
          contract.methods.getTotalPartnerContributions().call()
        ]);

        setPoolSize(web3.utils.fromWei(poolSizeWEI, 'ether'));
        const userShareEth = web3.utils.fromWei(userContribution, 'ether');
        setUserShare(parseFloat(userShareEth));

        const totalContributionsEth = web3.utils.fromWei(totalContributions, 'ether');
        const newSharePercentage = (parseFloat(userShareEth) / parseFloat(totalContributionsEth)) * 100;
        setSharePercentage(newSharePercentage);

        console.log("User share: " + userShareEth);
        console.log("Total contributions partners: " + totalContributionsEth);
        console.log("Share percentage: " + newSharePercentage);
        console.log("Total pool size: " + parseFloat(poolSize));

        const monthlyEarnings = 0.01 * parseFloat(poolSize) * (newSharePercentage / 100);
        setEstimatedMonthlyEarnings(Number(monthlyEarnings.toPrecision(4)));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }, [contract, web3]);

  const checkIfPartner = useCallback(async () => {
    console.log("Checking if partner");
    if (web3) {
      try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setUserAddress(account);

        const response = await database_api.get('/api/get_all_partners');
        const partners = response.data.partners;
        const isPartner = partners.some(partner => partner.address.toLowerCase() === account.toLowerCase());
        setIsPartner(isPartner);

        if (isPartner) {
          const userContribution = partners.find(partner => partner.address.toLowerCase() === account.toLowerCase()).contribution;
          fetchUserData(account, web3.utils.toWei(userContribution.toString(), 'ether'));
        }
      } catch (error) {
        console.error('Error checking if user is partner:', error);
      }
    }
  }, [web3, fetchUserData]);

  useEffect(() => {
    const checkPartnerStatus = async () => {
      if (web3) {
        try {
          console.log("Checking partner status");
          await checkIfPartner();
        } catch (error) {
          console.error('Error checking partner status:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    if (web3) {
      console.log("Web3 set");
      checkPartnerStatus();
    } else {
      console.log("Web3 not set");
      setIsLoading(false);
    }
  }, [web3, checkIfPartner]);

  const handleRevokePartnership = async () => {
    if (!web3 || !contract) {
      alert('Please connect your wallet.');
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      // Call the withdrawPartnership function in the smart contract
      await contract.methods.withdrawPartnership().send({ from: account });

      // Update the partner contribution in the database
      const response = await database_api.post('/api/remove_partner', { address: account });
      if (response.data.message === 'Partner removed successfully') {
        alert('Your partnership has been revoked and your contribution has been withdrawn.');
        navigate('/'); // Redirect to home page or another appropriate page
      } else {
        alert('There was an error with the database while processing your request. Please try again.');
      }
    } catch (error) {
      console.error('Error revoking partnership:', error);
      if (error.message.includes("Wait for funds to be available")) {
        alert('Unable to withdraw at this time. Please try again later when more funds are available in the pool.');
      } else if (error.message.includes("No contribution to withdraw")) {
        alert('You have no contribution to withdraw. Your partnership may have already been revoked.');
      } else {
        alert('There was an error while processing your request. Please try again.');
      }
    }
  };

  if (!isPartner) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <Logo onClick={() => navigate('/')} />
        </div>
        <div className={styles.main} style={{ marginTop: '-40px' }}>
        <p className={styles.slogan}>Your <span id={styles.distinguish}>Partner</span> Dashboard</p>
        <div className={`${commonStyles.content} ${styles.calculator}`}>
          <p className={styles.infoText}>You're not a partner. Please click <a href="/" style={{color: 'blue'}}>here</a> to go back to the homepage.</p>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Logo onClick={() => navigate('/')} />
      </div>
      <div className={styles.main} style={{ marginTop: '-40px' }}>
        <p className={styles.slogan}>Your <span id={styles.distinguish}>Partner</span> Dashboard</p>
        <div className={`${commonStyles.content} ${styles.calculator}`}>
          <div style={{ height: '200px', marginBottom: '20px' }}>
            <PartnerSharePieChart userShare={userShare} userAddress={userAddress} />
          </div>
          <div className={styles.calculatorContent}>
            <div className={styles.calculatorRow}>
              <p className={`${styles.infoText} ${styles.small}`}>
                Your Share Percentage in the Partner Pool 📈:
              </p>
              <p className={`${styles.infoText} ${styles.small} ${styles.floatRight}`}>
                <span className={styles.ethAmount}>{sharePercentage.toFixed(2)}%</span>
              </p>
            </div>
            <div className={styles.calculatorRow}>
              <p className={`${styles.infoText} ${styles.small}`}>
                Estimated Earnings This Month 💰*:
              </p>
              <p className={`${styles.infoText} ${styles.small} ${styles.floatRight}`}>
                <span className={styles.ethAmount}>{estimatedMonthlyEarnings}</span>
                <img 
                  src={ethereumLogo} 
                  alt="ETH" 
                  className={styles.ethLogo}
                  style={{marginRight: '0px'}}
                />
              </p>
            </div>
            <div className={styles.calculatorRow}>
              <p className={`${styles.infoText} ${styles.small}`}>
                Estimated Earnings Over Time*:
              </p>
            </div>
            <div className={styles.calculatorRow}>
              <ul className={`${styles.infoText} ${styles.small} ${styles.earningsList}`}>
                <li>3 months: </li>
                <li>6 months: </li>
                <li>1 year: </li>
                <li>2 years: </li>
              </ul>
              <ul className={`${styles.infoText} ${styles.small} ${styles.earningsAmounts}`}>
                <li><span className={styles.ethAmount}>{(estimatedMonthlyEarnings * 3).toFixed(4)}</span> <img 
                  src={ethereumLogo} 
                  alt="ETH" 
                  className={styles.ethLogo}
                  style={{marginRight: '0px'}}
                /></li>
                <li><span className={styles.ethAmount}>{(estimatedMonthlyEarnings * 6).toFixed(4)}</span> <img 
                  src={ethereumLogo} 
                  alt="ETH" 
                  className={styles.ethLogo}
                  style={{marginRight: '0px'}}
                /></li>
                <li><span className={styles.ethAmount}>{(estimatedMonthlyEarnings * 12).toFixed(4)}</span> <img 
                  src={ethereumLogo} 
                  alt="ETH" 
                  className={styles.ethLogo}
                  style={{marginRight: '0px'}}
                /></li>
                <li><span className={styles.ethAmount}>{(estimatedMonthlyEarnings * 24).toFixed(4)}</span> <img 
                  src={ethereumLogo} 
                  alt="ETH" 
                  className={styles.ethLogo}
                  style={{marginRight: '0px'}}
                /></li>
              </ul>
            </div>
            <span id={styles.subtext} style={{ position: 'relative', bottom: '10px' }}>* If current pool size and user share remains the same or expands.</span>
          </div>
        </div>
        <button id={styles.revokePartnership} className={styles.button} onClick={handleRevokePartnership}>Revoke Partnership ❌</button>
      </div>
      <div className={styles.footbar}>
        <Logo />
        <div className={styles.buttonGroup}>
          <button className={styles.footbarButton}><Mail /></button>
          <button className={styles.footbarButton}><img src={xLogo} alt="X Logo" /></button>
        </div>
      </div>
    </div>
  );
}

export default PartnerDashboard;
