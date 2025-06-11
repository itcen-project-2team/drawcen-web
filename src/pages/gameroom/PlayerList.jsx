import React, { useState, useEffect } from 'react';
import styles from './PlayerList.module.css';
import defaultAvatar from '../../assets/default-avatar.png';

const MAX_PLAYERS = 6;

const PlayerList = ({ players, recentChatMessages = [] }) => {
  const [speechBubbles, setSpeechBubbles] = useState(new Map());

  // 최근 채팅 메시지를 감지하여 말풍선 표시
  useEffect(() => {
    if (recentChatMessages.length === 0) return;

    const latestMessage = recentChatMessages[recentChatMessages.length - 1];
    
    console.log('🔍 최신 메시지 분석:', {
      type: latestMessage.type,
      message: latestMessage.message,
      nickname: latestMessage.nickname
    });
    
    // 채팅 메시지 처리 (일반 채팅 + 정답 메시지)
    if (latestMessage.type === 'chat' && latestMessage.nickname) {
      // 정답 메시지 패턴 확인
      const correctPatterns = [
        /(.+)님이 정답을 맞추셨습니다/,
        /(.+)님이 정답을 맞췄습니다/,
        /(.+) 님이 정답을 맞추셨습니다/,
        /(.+) 님이 정답을 맞췄습니다/
      ];
      
      let isCorrectMessage = false;
      let correctPlayerName = null;
      
      for (const pattern of correctPatterns) {
        const match = latestMessage.message.match(pattern);
        if (match) {
          isCorrectMessage = true;
          correctPlayerName = match[1].trim();
          console.log('✅ 정답 메시지 감지:', { pattern: pattern.source, correctPlayerName });
          break;
        }
      }
      
      if (isCorrectMessage && correctPlayerName) {
        // 정답을 맞춘 플레이어 찾기
        const playerId = players.find(player => player.nickname === correctPlayerName)?.id;
        
        console.log('🔍 정답 플레이어 검색:', { 
          correctPlayerName, 
          playerId, 
          availablePlayers: players.map(p => ({ id: p.id, nickname: p.nickname }))
        });
        
        if (playerId) {
          const bubbleId = Date.now();
          
          console.log('🎉 정답 말풍선 생성:', { playerId, correctPlayerName });
          
          // 정답 말풍선 추가
          setSpeechBubbles(prev => {
            const newBubbles = new Map(prev);
            newBubbles.set(playerId, {
              id: bubbleId,
              message: '정답입니다! 🎉',
              timestamp: Date.now(),
              isCorrect: true
            });
            console.log('🗣️ 정답 말풍선 상태:', Array.from(newBubbles.entries()));
            return newBubbles;
          });

          // 3초 후 말풍선 제거
          setTimeout(() => {
            setSpeechBubbles(prev => {
              const newBubbles = new Map(prev);
              const currentBubble = newBubbles.get(playerId);
              if (currentBubble && currentBubble.id === bubbleId) {
                console.log('⏰ 정답 말풍선 제거:', { playerId, bubbleId });
                newBubbles.delete(playerId);
              }
              return newBubbles;
            });
          }, 3000);
        } else {
          console.warn('⚠️ 정답 플레이어를 찾을 수 없음:', correctPlayerName);
        }
      } else {
        // 일반 채팅 메시지 처리
        console.log('💬 일반 채팅 처리:', latestMessage.nickname, '->', latestMessage.message);
        
        const playerId = players.find(player => player.nickname === latestMessage.nickname)?.id;
        
        if (playerId) {
          const bubbleId = Date.now();
          
          // 새 말풍선 추가
          setSpeechBubbles(prev => {
            const newBubbles = new Map(prev);
            newBubbles.set(playerId, {
              id: bubbleId,
              message: latestMessage.message,
              timestamp: Date.now(),
              isCorrect: false
            });
            return newBubbles;
          });

          // 3초 후 말풍선 제거
          setTimeout(() => {
            setSpeechBubbles(prev => {
              const newBubbles = new Map(prev);
              const currentBubble = newBubbles.get(playerId);
              if (currentBubble && currentBubble.id === bubbleId) {
                newBubbles.delete(playerId);
              }
              return newBubbles;
            });
          }, 3000);
        }
      }
    }
    // 시스템 메시지 처리 (기존 코드 유지)
    else if (latestMessage.type === 'system') {
      console.log('🎯 시스템 메시지 확인:', latestMessage.message);
      
      // 여러 가능한 정답 패턴들 확인
      const patterns = [
        /(.+)님이 정답을 맞추셨습니다/,
        /(.+)님이 정답을 맞췄습니다/,
        /(.+) 님이 정답을 맞추셨습니다/,
        /(.+) 님이 정답을 맞췄습니다/,
        /(.+)이 정답을 맞추셨습니다/,
        /(.+)가 정답을 맞추셨습니다/
      ];
      
      let playerName = null;
      
      for (const pattern of patterns) {
        const match = latestMessage.message.match(pattern);
        if (match) {
          playerName = match[1].trim();
          console.log('✅ 정답 패턴 매칭 성공:', { pattern: pattern.source, playerName });
          break;
        }
      }
      
      if (playerName) {
        const playerId = players.find(player => player.nickname === playerName)?.id;
        
        console.log('🔍 플레이어 검색:', { 
          playerName, 
          playerId, 
          availablePlayers: players.map(p => ({ id: p.id, nickname: p.nickname }))
        });
        
        if (playerId) {
          const bubbleId = Date.now();
          
          console.log('🎉 정답 말풍선 생성:', { playerId, playerName });
          
          // 정답 말풍선 추가
          setSpeechBubbles(prev => {
            const newBubbles = new Map(prev);
            newBubbles.set(playerId, {
              id: bubbleId,
              message: '정답입니다! 🎉',
              timestamp: Date.now(),
              isCorrect: true
            });
            console.log('🗣️ 정답 말풍선 상태:', Array.from(newBubbles.entries()));
            return newBubbles;
          });

          // 3초 후 말풍선 제거
          setTimeout(() => {
            setSpeechBubbles(prev => {
              const newBubbles = new Map(prev);
              const currentBubble = newBubbles.get(playerId);
              if (currentBubble && currentBubble.id === bubbleId) {
                console.log('⏰ 정답 말풍선 제거:', { playerId, bubbleId });
                newBubbles.delete(playerId);
              }
              return newBubbles;
            });
          }, 3000);
        } else {
          console.warn('⚠️ 플레이어를 찾을 수 없음:', playerName);
        }
      } else {
        console.log('ℹ️ 정답 패턴에 매칭되지 않는 시스템 메시지:', latestMessage.message);
      }
    }
    // 다른 타입의 메시지들도 확인
    else {
      console.log('ℹ️ 기타 메시지 타입:', latestMessage.type, latestMessage);
    }
  }, [recentChatMessages, players]);

  const placeholders = Array.from({ length: MAX_PLAYERS - players.length }, (_, i) => ({
    id: `placeholder-${i}`,
    placeholder: true
  }));
  const fullList = [...players, ...placeholders];

  return (
    <div className={styles.playerList}>
      {fullList.map((player, idx) =>
        player.placeholder ? (
          <div key={player.id} className={styles.playerItem + ' ' + styles.placeholder}>
            <div className={styles.emptyAvatar} />
            <div className={styles.playerInfo}>
              <div className={styles.nickname}>플레이어 대기중</div>
              <div className={styles.score}>-</div>
            </div>
          </div>
        ) : (
          <div key={player.id} className={`${styles.playerItem} ${player.nickname && player.isDrawing ? styles.drawing : ''}`}>
            {/* 말풍선 */}
            {speechBubbles.has(player.id) && (
              <div className={`${styles.speechBubble} ${speechBubbles.get(player.id).isCorrect ? styles.correctBubble : ''}`}>
                <div className={styles.speechBubbleContent}>
                  {speechBubbles.get(player.id).message}
                </div>
                <div className={styles.speechBubbleTail}></div>
              </div>
            )}
            
            <img 
              src={player.avatar || defaultAvatar} 
              alt="avatar" 
              className={styles.avatar}
            />
            <div className={styles.playerInfo}>
              <div className={styles.nickname}>
                {player.nickname}
                {player.isDrawing && (
                  <span className={styles.drawingIndicator}>
                    ✏️
                  </span>
                )}
              </div>
              <div className={styles.score}>{player.score}점</div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PlayerList; 