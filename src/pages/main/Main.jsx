import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';
import PageWrapper from '../../components/PageWrapper/PageWrapper';
import Modal from '../../components/modal/Modal';
import Button from '../../components/button/Button';
import background from '../../assets/background.png';
import logo from '../../assets/logo.png';
import pink from '../../assets/pink.png';
import editIcon from '../../assets/edit-icon.png';
import useUserStore from '../../stores/userStore';
import { checkLogIn, logout  } from '../../services/userService';

const Main = () => {
  const navigate = useNavigate();
  const { deleteUser, user, isLoggedIn, setUser } = useUserStore();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isRoomCodeModalOpen, setIsRoomCodeModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState(['', '', '', '', '', '']);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  // 페이지 로드 시 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsCheckingLogin(true);
      try {
        const userData = await checkLogIn();
        if (userData) {
          // 로그인된 상태 - 서버에서 { email: "user@example.com" } 형태로 응답
          setUser(userData);
        } else {
          navigate('/');
        }
      } catch (error) {
        navigate('/');
      } finally {
        setIsCheckingLogin(false);
      }
    };

    checkLoginStatus();
  }, [setUser, navigate]);

  const handleCreateRoom = () => {
    // TODO: 방 생성 로직 구현
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
  };

  const handleEditProfile = () => {
    setIsProfileModalOpen(false);
    setIsNicknameModalOpen(true);
  };

  const handleNicknameChange = () => {
    // TODO: 닉네임 변경 로직 구현
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
      // TODO: 방 입장 로직 구현
    }
  };

  const handleClearRoomCode = () => {
    setRoomCode(['', '', '', '', '', '']);
    // 첫 번째 입력창으로 포커스 이동
    const firstInput = document.querySelector('input[data-index="0"]');
    if (firstInput) firstInput.focus();
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      // 1. 서버에 로그아웃 요청
      await logout();
      
      // 2. 전역 상태 초기화
      deleteUser();
      
      // 3. 랜딩페이지로 이동
      navigate('/');
    } catch (error) {
      // 에러가 발생해도 전역 상태는 초기화하고 로그인 페이지로 이동
      deleteUser();
      navigate('/');
    }
  };

  // 로그인 상태 체크 중이면 로딩 표시
  if (isCheckingLogin) {
    return (
      <PageWrapper 
        className="main" 
        backgroundImage={background} 
        isLoading={true} 
        loadingText="로그인 상태 확인 중..."
      />
    );
  }

  return (
    <PageWrapper className="main" backgroundImage={background}>
      {/* 로그아웃 버튼 */}
      <button className="logout-button content-animate" onClick={handleLogout}>
        로그아웃
      </button>
      
      <div className="profile-container content-animate" onClick={handleProfileClick}>
        <img src={pink} alt="Profile" className="profile-image" />
        <span className="profile-text">{user.nickname || user.id || '사용자'}</span>
      </div>
      <div className="main-content main-content-animate">
        <img src={logo} alt="DrawCen Logo" className="main-logo logo-animate" />
        <div className="button-container content-animate-delay-1">
          <button className="game-button create-room" onClick={handleCreateRoom}>
            방 생성
          </button>
          <button className="game-button join-room" onClick={handleJoinRoom}>
            방 코드 입력
          </button>
        </div>
      </div>

      {/* 프로필 모달 */}
      <Modal isOpen={isProfileModalOpen} onClose={handleCloseModal}>
        <div className="modal-profile">
          <img src={pink} alt="Profile" className="modal-profile-image" />
          <div className="modal-profile-info">
            <img src={editIcon} alt="Edit" className="edit-icon" onClick={handleEditProfile} />
            <span className="modal-profile-name">{user.nickname || user.id || '사용자'}</span>
          </div>
        </div>
      </Modal>

      {/* 닉네임 수정 모달 */}
      <Modal isOpen={isNicknameModalOpen} onClose={handleCloseModal}>
        <div className="nickname-modal">
          <div className="nickname-top-buttons">
            <Button variant="outline" size="medium" shape="square">닉네임 생성</Button>
            <span className="current-nickname-text">승준짱 승준짱</span>
          </div>
          <Button variant="secondary" size="medium" onClick={handleNicknameChange}>
            수정
          </Button>
        </div>
      </Modal>

      {/* 방 코드 입력 모달 */}
      <Modal isOpen={isRoomCodeModalOpen} onClose={handleCloseModal}>
        <Button 
          variant="icon" 
          shape="circle" 
          size="medium" 
          onClick={handleClearRoomCode}
          className="room-code-clear-button"
        >
          ↺
        </Button>
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
          <Button variant="secondary" size="medium" onClick={handleRoomEnter}>
            입장
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default Main; 