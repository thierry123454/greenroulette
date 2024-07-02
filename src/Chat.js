import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from './Chat.module.css';
import { ReactComponent as GRChat } from './images/gr_chat.svg'
import { ReactComponent as Send } from './images/send.svg'

const socket = io('https://yourserver.com');  // Your backend server URL

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('message', message => {
      setMessages(prev => [...prev, message]);
    });

    // Cleanup on component unmount
    return () => socket.off('message');
  }, []);

  const sendMessage = () => {
    if(input.trim()) {
      socket.emit('send message', input);
      setInput('');
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <GRChat id={styles.logo} />
        <span id={styles.x}>✕</span>
      </div>
      <div className={styles.chatTotalBets}>
        <div className={styles.totalRed}>
          <span id={styles.labelRed}>Total Red</span>
          <br />
          1623.18 $
        </div>
        <div className={styles.totalBlack}>
        <span id={styles.labelBlack}>Total Black</span>
        <br />
        2323.18 $
        </div>
      </div>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.user === 'You' ? styles.you : ''}`}>{msg.text}</div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message here..." />
        <Send id={styles.send} onClick={sendMessage}/>
      </div>
    </div>
  );
}

export default Chat;
