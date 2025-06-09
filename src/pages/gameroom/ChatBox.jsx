import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatBox.module.css';

const ChatBox = ({ messages, onSendMessage, currentUser }) => {
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
    
    // 메시지 전송
    if (onSendMessage) {
      onSendMessage(newMessage.trim());
    }
    
    setNewMessage('');
  };

  const formatMessage = (msg) => {
    // 메시지 타입별 포맷팅
    switch (msg.type) {
      case 'system':
        return {
          className: `${styles.message} ${styles.systemMessage}`,
          showNickname: false,
          content: msg.message
        };
      case 'error':
        return {
          className: `${styles.message} ${styles.errorMessage}`,
          showNickname: false,
          content: msg.message
        };
      case 'correct':
        return {
          className: `${styles.message} ${styles.correctMessage}`,
          showNickname: false,
          content: msg.message
        };
      case 'drawer':
        return {
          className: `${styles.message} ${styles.drawerMessage}`,
          showNickname: false,
          content: msg.isDrawerOnly ? `🎯 ${msg.message}` : msg.message
        };
      case 'chat':
      default:
        return {
          className: `${styles.message} ${styles.chatMessage}`,
          showNickname: true,
          content: msg.message
        };
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={styles.chatBox}>
      <div className={styles.chatHeader}>
        <h3>💬 채팅</h3>
      </div>
      
      <div className={styles.chatMessages}>
        {messages.map((msg) => {
          const formatInfo = formatMessage(msg);
          
          // 모든 메시지 표시 (이미 GameRoom에서 적절히 필터링됨)
          return (
            <div key={msg.id} className={formatInfo.className}>
              {formatInfo.showNickname && (
                <div className={styles.messageHeader}>
                  <span className={styles.nickname}>
                    {msg.nickname || '익명'}
                  </span>
                </div>
              )}
              <div className={styles.messageContent}>
                {formatInfo.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form className={styles.chatInput} onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className={styles.chatInputField}
        />
        <button 
          type="submit" 
          className={styles.chatSendButton}
          disabled={!newMessage.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatBox; 