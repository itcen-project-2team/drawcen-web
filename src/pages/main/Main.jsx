import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';
import Modal from '../../components/modal/Modal';
import Button from '../../components/button/Button';
import WaitingRoomModal from '../../components/room/WaitingRoomModal';
import background from '../../assets/background.png';
import logo from '../../assets/logo.png';
import pink from '../../assets/pink.png';
import editIcon from '../../assets/edit-icon.png';
import useUserStore from '../../stores/userStore';
import { checkLogIn, logout, getCurrentRoom } from '../../services/userService';
import { createRoom } from '../../services/roomService';
import webSocketService from '../../utils/websocket';

const Main = () => {
  const navigate = useNavigate();
  const { deleteUser, user, isLoggedIn, setUser } = useUserStore();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isRoomCodeModalOpen, setIsRoomCodeModalOpen] = useState(false);
  const [isWaitingRoomOpen, setIsWaitingRoomOpen] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoomCode, setCurrentRoomCode] = useState(null);
  const [participants, setParticipants] = useState([]);
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
          
          // 현재 참여 중인 방이 있는지 확인
          await checkCurrentRoom();
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Main - 로그인 상태 확인 실패:', error);
        navigate('/');
      } finally {
        setIsCheckingLogin(false);
      }
    };

    checkLoginStatus();
  }, [setUser, navigate]);

  // 현재 참여 중인 방 확인 및 자동 연결
  const checkCurrentRoom = async () => {
    try {
      const currentRoomInfo = await getCurrentRoom();
      
      if (currentRoomInfo && currentRoomInfo.roomCode) {
        console.log('기존 참여 중인 방 발견:', currentRoomInfo);
        
        // WebSocket 연결
        await webSocketService.connect();
        console.log('기존 방 WebSocket 연결 완료');
        
        setCurrentRoomCode(currentRoomInfo.roomCode);
        if (currentRoomInfo.participants) {
          setParticipants(currentRoomInfo.participants);
        }
        
        // 방 구독
        webSocketService.subscribeToRoom(currentRoomInfo.roomCode, (message) => {
          console.log('기존 방 메시지 수신:', message);
          
          if (message.participantList) {
            setParticipants(message.participantList);
            console.log('참가자 목록 업데이트:', message.participantList);
          }
          
          if (message.type === 'GAME_STARTED') {
            console.log('게임 시작!');
            setIsWaitingRoomOpen(false);
            navigate(`/game/${message.gameId}`);
          }
        });
        
        // 대기실 모달 자동으로 열기
        setIsWaitingRoomOpen(true);
        console.log('기존 참여 방 대기실 모달 자동 열기');
      }
    } catch (error) {
      console.error('현재 방 확인 중 오류:', error);
      // 에러가 발생해도 메인 페이지는 정상적으로 표시
    }
  };

  // 컴포넌트 언마운트 시 WebSocket 연결 해제
  useEffect(() => {
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const handleCreateRoom = async () => {
    try {
      // 1. WebSocket 연결
      await webSocketService.connect();
      console.log('WebSocket 연결 완료');
      
      // 2. 서버에 방 생성 요청
      const roomData = await createRoom(user.id);
      console.log('방 생성 완료:', roomData);
      
      setCurrentRoomCode(roomData.roomCode);
      
      // 3. 방 구독 (실시간 업데이트 수신)
      webSocketService.subscribeToRoom(roomData.roomCode, (message) => {
        console.log('방 메시지 수신:', message);
        
        if (message.participantList) {
          setParticipants(message.participantList);
          console.log('참가자 목록 업데이트:', message.participantList);
        }
        
        if (message.type === 'GAME_STARTED') {
          console.log('게임 시작!');
          setIsWaitingRoomOpen(false);
          // TODO: 게임 페이지로 이동
          navigate(`/game/${message.gameId}`);
        }
      });
      
      // 4. 방 참여 메시지 전송 (이벤트 트리거를 위해)
      // 백엔드에서 이미 참가자로 등록되어 있지만, 이벤트 발행을 위해 필요
      setTimeout(() => {
        webSocketService.joinRoom(roomData.roomCode);
        console.log('방 참여 메시지 전송 (이벤트 트리거용)');
      }, 500);
      
      // 5. 대기실 모달 표시
      setIsWaitingRoomOpen(true);
      
    } catch (error) {
      console.error('방 생성 중 오류:', error);
      alert('방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleStartGame = async () => {
    if (!currentRoomCode) return;
    
    try {
      webSocketService.startGame(currentRoomCode);
    } catch (error) {
      console.error('게임 시작 실패:', error);
      alert('게임 시작에 실패했습니다.');
    }
  };

  const handleLeaveRoom = () => {
    try {
      webSocketService.leaveRoom();
      webSocketService.disconnect();
      setCurrentRoomCode(null);
      setParticipants([]);
      setIsWaitingRoomOpen(false);
    } catch (error) {
      console.error('방 나가기 실패:', error);
    }
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

  const handleRoomCodeChange = (e) => {
    const value = e.target.value;
    // 숫자만 입력 가능하도록 제한
    if (/^\d*$/.test(value)) {
      setRoomCodeInput(value);
    }
  };

  const handleRoomCodeKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRoomEnter();
    }
  };

  const handleRoomEnter = async () => {
    const code = roomCodeInput.trim();
    if (!code) {
      alert('방 코드를 입력해주세요.');
      return;
    }
    
    try {
      // 1. WebSocket 연결
      await webSocketService.connect();
      console.log('WebSocket 연결 완료');
      
      const roomCodeNumber = parseInt(code);
      setCurrentRoomCode(roomCodeNumber);
      
      // 2. 에러 콜백 설정
      webSocketService.setErrorCallback((errorMessage) => {
        console.error('방 참여 에러:', errorMessage);
        alert(`방 입장 실패: ${errorMessage}`);
        
        // 에러 발생 시 정리
        webSocketService.disconnect();
        setCurrentRoomCode(null);
        setParticipants([]);
        setIsWaitingRoomOpen(false);
        
        // 에러 콜백 제거
        webSocketService.setErrorCallback(null);
      });
      
      // 3. 방 구독 (실시간 업데이트 수신)
      webSocketService.subscribeToRoom(roomCodeNumber, (message) => {
        console.log('방 메시지 수신:', message);
        
        if (message.participantList) {
          setParticipants(message.participantList);
          console.log('참가자 목록 업데이트:', message.participantList);
          
          // 첫 번째 정상 메시지 수신 시 대기실 모달 열기
          if (!isWaitingRoomOpen) {
            setIsRoomCodeModalOpen(false);
            setRoomCodeInput('');
            setIsWaitingRoomOpen(true);
            console.log('방 참여 성공, 대기실 모달 열기');
            
            // 성공 시 에러 콜백 제거
            webSocketService.setErrorCallback(null);
          }
        }
        
        if (message.type === 'GAME_STARTED') {
          console.log('게임 시작!');
          setIsWaitingRoomOpen(false);
          // TODO: 게임 페이지로 이동
          navigate(`/game/${message.gameId}`);
        }
      });
      
      // 4. 방 참여 메시지 전송
      webSocketService.joinRoom(roomCodeNumber);
      console.log('방 참여 요청 전송:', roomCodeNumber);
      
    } catch (error) {
      console.error('방 입장 중 오류:', error);
      alert('방 입장에 실패했습니다. 방 코드를 확인해주세요.');
      // WebSocket 연결 해제
      webSocketService.disconnect();
      setCurrentRoomCode(null);
      setParticipants([]);
    }
  };

  const handleClearRoomCode = () => {
    setRoomCodeInput('');
    // 입력창에 포커스
    const roomCodeInput = document.querySelector('.room-code-input input');
    if (roomCodeInput) roomCodeInput.focus();
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      // 1. 서버에 로그아웃 요청
      await logout();
      console.log('서버 로그아웃 완료');
      
      // 2. 전역 상태 초기화
      deleteUser();
      console.log('전역 상태 초기화 완료');
      
      // 3. 랜딩페이지로 이동
      navigate('/');
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      // 에러가 발생해도 전역 상태는 초기화하고 로그인 페이지로 이동
      deleteUser();
      navigate('/');
    }
  };

  // 로그인 상태 체크 중이면 로딩 표시
  if (isCheckingLogin) {
    return (
      <div className="main" style={{ backgroundImage: `url(${background})` }}>
        <div style={{ color: 'white', fontSize: '18px', textAlign: 'center', marginTop: '50vh' }}>
          로그인 상태 확인 중...
        </div>
      </div>
    );
  }

  return (
    <div className="main" style={{ backgroundImage: `url(${background})` }}>
      {/* 로그아웃 버튼 */}
      <button className="logout-button" onClick={handleLogout}>
        로그아웃
      </button>
      
      <div className="profile-container" onClick={handleProfileClick}>
        <img src={pink} alt="Profile" className="profile-image" />
        <span className="profile-text">{user.nickname || user.id || '사용자'}</span>
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
            <input
              type="text"
              placeholder="방 코드를 입력하세요"
              value={roomCodeInput}
              onChange={handleRoomCodeChange}
              onKeyDown={handleRoomCodeKeyPress}
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '18px',
                textAlign: 'center',
                border: '2px solid #ddd',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
          <Button variant="secondary" size="medium" onClick={handleRoomEnter}>
            입장
          </Button>
        </div>
      </Modal>

      {/* 대기실 모달 */}
      <WaitingRoomModal
        isOpen={isWaitingRoomOpen}
        onClose={() => setIsWaitingRoomOpen(false)}
        roomCode={currentRoomCode}
        participants={participants}
        currentUser={user}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
};

export default Main; 