import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatBox.module.css';

const ChatBox = ({ messages }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    // 메시지 전송 로직 추가 예정
    setNewMessage('');
  };

  return (
    <div className={styles.chatBox}>
      <div className={styles.chatMessages}>
        {messages.map((msg, index) => (
          <div key={msg.id} className={styles.message}>
            <span className={styles.nickname}>{msg.nickname}</span>
            <span className={styles.text}>{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className={styles.chatInput} onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
};

export default ChatBox; 