import React from 'react';
import styles from './RankingModal.module.css';
import { getUserProfileImage } from '../../utils/profileImages';

const RankingModal = ({ isOpen, onClose, rankings, gameId }) => {
  if (!isOpen) return null;

  // 점수 순으로 정렬
  const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);
  
  // 기존 플레이어와 테스트 플레이어를 합쳐서 점수 순으로 정렬
  const sortedRankingsWithTest = [...sortedRankings].sort((a, b) => b.score - a.score);

  // 동점자 처리를 위한 순위 계산
  const calculateRank = (players) => {
    let currentRank = 1;
    return players.map((player, index) => {
      if (index > 0 && player.score < players[index - 1].score) {
        currentRank = index + 1;
      }
      return {
        ...player,
        rank: currentRank
      };
    });
  };

  const playersWithRank = calculateRank(sortedRankingsWithTest);

  // 순위별 메달/번호 반환 (실제 순위 기반)
  const getRankDisplay = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  // 순위별 스타일 클래스 (실제 순위 기반)
  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return styles.firstPlace;
      case 2: return styles.secondPlace;
      case 3: return styles.thirdPlace;
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
            {playersWithRank.map((player, index) => (
              <div key={player.memberId} className={`${styles.rankingItem} ${getRankClass(player.rank)}`}>
                <div className={styles.rankDisplay}>
                  {getRankDisplay(player.rank)}
                </div>
                <div className={styles.playerInfo}>
                  <img 
                    src={getUserProfileImage(player)} 
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