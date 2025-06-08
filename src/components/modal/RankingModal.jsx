import React from 'react';
import styles from './RankingModal.module.css';
import avatar from '../../assets/default-avatar.png';

const RankingModal = ({ isOpen, onClose, rankings, gameId }) => {
  if (!isOpen) return null;

  // 점수 순으로 정렬
  const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);

  // 순위별 메달/번호 반환
  const getRankDisplay = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}위`;
    }
  };

  // 순위별 스타일 클래스
  const getRankClass = (index) => {
    switch (index) {
      case 0: return styles.firstPlace;
      case 1: return styles.secondPlace;
      case 2: return styles.thirdPlace;
      default: return styles.normalPlace;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div></div>
          <h3 className={styles.modalTitle}>🎊 결과 🎊</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.rankingList}>
            {sortedRankings.map((player, index) => (
              <div key={player.memberId} className={`${styles.rankingItem} ${getRankClass(index)}`}>
                <div className={styles.rankDisplay}>
                  {getRankDisplay(index)}
                </div>
                <div className={styles.playerInfo}>
                  <img 
                    src={player.avatar || avatar} 
                    alt="avatar" 
                    className={styles.playerAvatar}
                  />
                  <div className={styles.playerDetails}>
                    <span className={styles.playerName}>{player.nickname}</span>
                  </div>
                </div>
                <div className={styles.scoreInfo}>
                  <span className={styles.score}>{player.score}</span>
                  <span className={styles.scoreLabel}>점</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.modalFooter}>
            <button className={styles.confirmButton} onClick={onClose}>
              나가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingModal; 