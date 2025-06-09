import React from 'react';
import styles from './RankingModal.module.css';
import avatar from '../../assets/default-avatar.png';

const RankingModal = ({ isOpen, onClose, rankings, gameId }) => {
  if (!isOpen) return null;

  // 점수 순으로 정렬
  const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);

  // 임시 테스트용 플레이어 4명 추가
  const testPlayers = [
    { memberId: 'test1', nickname: '테스트플레이어테스트 플레이어', score: 85, avatar: null },
    { memberId: 'test2', nickname: '테스트플레이어2', score: 72, avatar: null },
    { memberId: 'test3', nickname: '테스트플레이어3', score: 68, avatar: null },
    { memberId: 'test4', nickname: '테스트플레이어4', score: 45, avatar: null }
  ];
  
  // 기존 플레이어와 테스트 플레이어를 합쳐서 점수 순으로 정렬
  const sortedRankingsWithTest = [...sortedRankings, ...testPlayers].sort((a, b) => b.score - a.score);

  // 순위별 메달/번호 반환
  const getRankDisplay = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}`;
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
            {sortedRankingsWithTest.map((player, index) => (
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