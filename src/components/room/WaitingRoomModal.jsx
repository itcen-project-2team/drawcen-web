import React, { useState, useEffect } from 'react';
import './WaitingRoomModal.css';
import Modal from '../modal/Modal';
import Button from '../button/Button';

const WaitingRoomModal = ({ 
  isOpen, 
  onClose, 
  roomCode, 
  participants = [], 
  currentUser,
  onStartGame, 
  onLeaveRoom 
}) => {
  const [isGameStarting, setIsGameStarting] = useState(false);

  // 현재 사용자가 방장인지 확인
  const currentUserParticipant = participants.find(participant => 
    participant.memberId === currentUser?.id
  );
  const isHost = currentUserParticipant?.host === true;

  console.log('현재 사용자:', currentUser);
  console.log('참가자 목록:', participants);
  console.log('현재 사용자 참가자 정보:', currentUserParticipant);
  console.log('방장 여부:', isHost);

  const handleStartGame = async () => {
    setIsGameStarting(true);
    try {
      await onStartGame();
    } catch (error) {
      console.error('게임 시작 실패:', error);
      setIsGameStarting(false);
    }
  };

  const handleLeaveRoom = () => {
    onLeaveRoom();
    onClose();
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode.toString()).then(() => {
      alert('방 코드가 복사되었습니다!');
    }).catch(() => {
      alert('복사에 실패했습니다.');
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleLeaveRoom}>
      <div className="waiting-room-modal">
        <div className="waiting-room-header">
          <h2>게임 대기실</h2>
          <div className="room-code-section">
            <span className="room-code-label">방 코드:</span>
            <div className="room-code-display">
              <span className="room-code">{roomCode}</span>
              <button className="copy-button" onClick={copyRoomCode}>
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="participants-section">
          <h3>참가자 ({participants.length}명)</h3>
          <div className="participants-list">
            {participants.map((participant, index) => (
              <div key={participant.memberId || index} className="participant-item">
                <div className="participant-avatar">👤</div>
                <span className="participant-name">
                  {participant.memberName || participant.nickname || participant.name || `참가자 ${index + 1}`}
                  {participant.host && ' 👑'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="waiting-room-actions">
          <Button 
            variant="secondary" 
            size="large" 
            onClick={handleLeaveRoom}
            disabled={isGameStarting}
          >
            떠나기
          </Button>
          {isHost && (
            <Button 
              variant="primary" 
              size="large" 
              onClick={handleStartGame}
              disabled={participants.length < 2 || isGameStarting}
            >
              {isGameStarting ? '게임 시작 중...' : '게임 시작'}
            </Button>
          )}
        </div>

        {isHost && participants.length < 2 && (
          <div className="waiting-message">
            게임을 시작하려면 최소 2명의 참가자가 필요합니다.
          </div>
        )}

        {!isHost && (
          <div className="waiting-message">
            방장이 게임을 시작할 때까지 기다려주세요.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WaitingRoomModal; 