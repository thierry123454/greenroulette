import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';

import styles from './Chat.module.css';
import commonStyles from './CommonStyles.module.css'

import { ReactComponent as GRChat } from './images/gr_chat.svg'
import { ReactComponent as Send } from './images/send.svg'
import { GameContext } from './GameContext';
import logo from './images/logo.svg';

const socket = io('http://localhost:3002');
const timer = io('https://localhost:3001', { secure: true });

timer.on('connect', () => {
  console.log('Connected to the server');
});

const roundTwoDecimals = (number) => {
  return Math.round((number + Number.EPSILON) * 100) / 100
};

function Chat({ setIsChatOpen, isChatOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { gameState } = useContext(GameContext);
  const { userAddress, bet, exchange, total_red, total_black } = gameState;

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('message', message => {
      setMessages(prev => [...prev, message]);
      console.log(messages);
    });

    // Cleanup on component unmount
    return () => socket.off('message');
  }, []);

  // Get game state information
  useEffect(() => {
      const timerHandler = (message) => {
        // Format the special message for display
        const specialMessage = {
          text: ` just put ${roundTwoDecimals(message.betAmount * message.betExchange)} USD on ${message.betChoice === 0 ? "Red" : "Black"}!`,
          user: message.user,
          type: 'bet',
          incomingBetChoice: message.betChoice
        };
        setMessages(prev => [...prev, specialMessage]);
      };
  
      // Listen for timer updates from server
      timer.on('special bet message', timerHandler);
  
      return () => {
        timer.off('special bet message', timerHandler);
      };
    }, []);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && input.trim()) {
      sendMessage();
      event.preventDefault(); // Prevent the default action to avoid a form submit behavior
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      console.log(messagesEndRef.current.scrollTop);
      console.log(messagesEndRef.current.scrollHeight);
      console.log(messagesEndRef.current.scrollHeight - messagesEndRef.current.scrollTop);
      if (messagesEndRef.current.scrollTop >= messagesEndRef.current.scrollHeight - 400)
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && input.length <= 200) {
      // Send the message with additional user data
      socket.emit('send message', userAddress, bet.choice, bet.amount, input);
      setInput('');
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <div className={`${commonStyles.popUpContainer} ${styles.chatContainer} ${isChatOpen ? styles.open : styles.closed}`}>
      <div className={`${commonStyles.popUpHeader} ${styles.chatHeader}`}>
        <GRChat id={styles.logo} />
        <span id={commonStyles.x} onClick={handleCloseChat}>✕</span>
      </div>
      <div className={styles.chatTotalBets}>
        <div className={styles.totalRed}>
          <span id={styles.labelRed}>Total Red</span>
          <br />
          {roundTwoDecimals(total_red * exchange)} $
        </div>
        <div className={styles.totalBlack}>
        <span id={styles.labelBlack}>Total Black</span>
        <br />
        {roundTwoDecimals(total_black * exchange)} $
        </div>
      </div>
      <div className={styles.messages} ref={messagesEndRef}>
        <div key={-1} className={`${styles.message}`}>
          <span id={styles.userInfo}>
          <img  src={logo} id={styles.logoSmall} alt="GreenRoulette"/>
          </span>
          <br />
          <div className={styles.messageContent}>
            Welcome to GreenRoulette Chat! 🌍💬
            {isChatOpen}
            <br />
            <br />
            We’re thrilled to have you here. Get ready to connect with other players in real-time! Before you dive into chatting, here are a few rules to keep in mind:
            <br />
            <ul>
              <li>Be Respectful: Treat everyone with respect. Abusive language, harassment, and discrimination are not tolerated.</li>
              <li>Stay on Topic: Please keep conversations relevant to the game and betting.</li>
              <li>No Spamming: Avoid repetitive messages and flooding the chat. Let everyone have a chance to speak.</li>
              <li>Privacy Matters: Don’t share personal information or ask for others' personal details.</li>
              <li>Remember, violating these rules can lead to a timeout or ban from chat. Let’s create a positive and enjoyable environment for everyone!</li>
            </ul>
            Happy Chatting! 🚀
          </div>
        </div>

        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.user === userAddress ? styles.you : ''}`}>
            {
            msg.type !== 'bet' ?
            <>
              <span id={styles.userInfo}>
                {msg.user === userAddress ? "You " : msg.user.substring(0,6) + "..." + msg.user.substring(userAddress.length - 4) + " "}
                <span style={{ color: msg.betChoice !== null ? (msg.betChoice === 0 ? '#CA0000' : "#171717") : 'gray' }}>
                  {msg.betChoice !== null ?
                    `(${roundTwoDecimals(msg.betAmount * exchange)} USD, ${(msg.betChoice === 0 ? 'Red' : "Black")})` :
                    "(No Bet)"
                  }
                </span>
              </span>
              <br />
            </> :
            ''
            }
            <div className={`
            ${styles.messageContent} 
            ${msg.user === userAddress ? styles.you : ''}
            ${msg.type === 'bet' ? styles.betMessage : ''}
            ${msg.incomingBetChoice === 0 ? styles.guessRed : styles.guessBlack }
            `}>
              {
              msg.type === 'bet' ? 
              (msg.user.toLowerCase() === userAddress ? "You " + msg.text : msg.user.substring(0,6) + "..." + msg.user.substring(userAddress.length - 4) + " " + msg.text)
              : msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
      <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          maxLength={200} // Limits input to 200 characters
        />
        <Send id={styles.send} onClick={sendMessage}/>
      </div>
    </div>
  );
}

export default Chat;
