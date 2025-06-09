import React from 'react';
import styles from './PlayerList.module.css';
import defaultAvatar from '../../assets/default-avatar.png';

const MAX_PLAYERS = 6;

const PlayerList = ({ players }) => {
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