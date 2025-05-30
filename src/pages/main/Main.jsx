import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';
import background from '../../assets/background.png';
import logo from '../../assets/logo.png';
import pink from '../../assets/pink.png';

const Main = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    // TODO: 방 생성 로직 구현
    console.log('방 생성');
  };

  const handleJoinRoom = () => {
    // TODO: 방 참여 로직 구현
    console.log('방 참여');
  };

  return (
    <div className="main" style={{ backgroundImage: `url(${background})` }}>
      <div className="profile-container">
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
    </div>
  );
};

export default Main; 