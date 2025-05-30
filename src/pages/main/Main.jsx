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

  const handleCreateRoom = () => {
    // TODO: 방 생성 로직 구현
    console.log('방 생성');
  };

  const handleJoinRoom = () => {
    // TODO: 방 참여 로직 구현
    console.log('방 참여');
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleTeamCodeInput = () => {
    // TODO: 팀 코드 입력 로직 구현
    console.log('팀 코드 입력');
  };

  const handleEditProfile = () => {
    // TODO: 프로필 편집 로직 구현
    console.log('프로필 편집');
  };

  return (
    <div className="main" style={{ backgroundImage: `url(${background})` }}>
      <div className="profile-container" onClick={handleProfileClick}>
        <img src={pink} alt="Profile" className="profile-image" />
        <span className="profile-text">채원쓰</span>
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
                <span className="modal-profile-name">채원쓰</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main; 