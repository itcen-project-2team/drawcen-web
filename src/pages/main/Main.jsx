import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';
import background from '../../assets/background.png';
import logo from '../../assets/logo.png';
import pink from '../../assets/pink.png';
import editIcon from '../../assets/edit-icon.png';

const Main = () => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isRoomCodeModalOpen, setIsRoomCodeModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState(['', '', '', '', '', '']);

  const handleCreateRoom = () => {
    // TODO: 방 생성 로직 구현
    console.log('방 생성');
  };

  const handleJoinRoom = () => {
    setIsRoomCodeModalOpen(true);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsProfileModalOpen(false);
    setIsNicknameModalOpen(false);
    setIsRoomCodeModalOpen(false);
  };

  const handleTeamCodeInput = () => {
    // TODO: 팀 코드 입력 로직 구현
    console.log('팀 코드 입력');
  };

  const handleEditProfile = () => {
    setIsProfileModalOpen(false);
    setIsNicknameModalOpen(true);
  };

  const handleNicknameChange = () => {
    // TODO: 닉네임 변경 로직 구현
    console.log('닉네임 수정');
  };

  const handleRoomCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newRoomCode = [...roomCode];
      newRoomCode[index] = value;
      setRoomCode(newRoomCode);
      
      // 자동으로 다음 입력창으로 이동
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleRoomEnter = () => {
    const code = roomCode.join('');
    if (code.length === 6) {
      console.log('방 입장:', code);
      // TODO: 방 입장 로직 구현
    }
  };

  const handleClearRoomCode = () => {
    setRoomCode(['', '', '', '', '', '']);
    // 첫 번째 입력창으로 포커스 이동
    const firstInput = document.querySelector('input[data-index="0"]');
    if (firstInput) firstInput.focus();
  };

  return (
    <div className="main" style={{ backgroundImage: `url(${background})` }}>
      <div className="profile-container" onClick={handleProfileClick}>
        <img src={pink} alt="Profile" className="profile-image" />
        <span className="profile-text">채원쓰 채원쓰</span>
      </div>
      <div className="main-content">
        <img src={logo} alt="DrawCen Logo" className="main-logo" />
        <div className="button-container">
          <button className="game-button create-room" onClick={handleCreateRoom}>
            방 생성
          </button>
          <button className="game-button join-room" onClick={handleJoinRoom}>
            방 코드 입력
          </button>
        </div>
      </div>

      {/* 프로필 모달 */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ×
            </button>
            <div className="modal-profile">
              <img src={pink} alt="Profile" className="modal-profile-image" />
              <div className="modal-profile-info">
                <img src={editIcon} alt="Edit" className="edit-icon" onClick={handleEditProfile} />
                <span className="modal-profile-name">승준짱 승준짱</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 닉네임 수정 모달 */}
      {isNicknameModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ×
            </button>
            <div className="nickname-modal">
              <div className="nickname-top-buttons">
                <button className="nickname-type-button">닉네임 생성</button>
                <span className="current-nickname-text">승준짱 승준짱</span>
              </div>
              <button className="nickname-submit-button" onClick={handleNicknameChange}>
                수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 방 코드 입력 모달 */}
      {isRoomCodeModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ×
            </button>
            <button className="room-code-clear-button" onClick={handleClearRoomCode}>
              ↺
            </button>
            <div className="room-code-modal">
              <div className="room-code-input">
                {roomCode.map((code, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    data-index={index}
                    value={code}
                    onChange={(e) => handleRoomCodeChange(index, e.target.value)}
                  />
                ))}
              </div>
              <button className="room-code-submit-button" onClick={handleRoomEnter}>
                입장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main; 