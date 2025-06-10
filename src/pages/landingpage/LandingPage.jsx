import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import PageWrapper from '../../components/pageWrapper/PageWrapper';
import background from '../../assets/background.png';
import logo from '../../assets/logo.png';
import loginBtn from '../../assets/loginbtn.png';
import playGuide1 from '../../assets/playguide-01.png';
import playGuide2 from '../../assets/playguide-02.png';
import playGuide3 from '../../assets/playguide-03.png';
import playGuide4 from '../../assets/playguide-04.png';
import { kakaoLogin, checkLogIn } from '../../services/userService';
import useUserStore from '../../stores/userStore';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentGuide, setCurrentGuide] = useState(0);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  const [progressKey, setProgressKey] = useState(0); // 애니메이션 재시작용
  
  // useUserStore에서 필요한 함수들 가져오기
  const { setUser, isLoggedIn } = useUserStore();
  
  const guideImages = [playGuide1, playGuide2, playGuide3, playGuide4];
  const guideTexts = [
    "출제자에게 제시어가 주어집니다.",
    "출제자는 제시어를 그림으로 표현합니다.",
    "다른 참가자가 정답을 맞추면,",
    "출제자와 정답자는 점수를 획득합니다."
  ];

  // 페이지 로드 시 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsCheckingLogin(true);
      try {
        const userData = await checkLogIn();
        if (userData) {
          // 로그인된 상태 - 서버에서 { email: "user@example.com" } 형태로 응답
          setUser(userData);
        }
      } catch (error) {
        // 로그인 상태 확인 실패 시 무시
      } finally {
        setIsCheckingLogin(false);
      }
    };

    checkLoginStatus();
  }, [setUser]);

  // 로그인 상태 확인 후 메인페이지로 리다이렉트
  useEffect(() => {
    if (!isCheckingLogin && isLoggedIn) {
      navigate('/main');
    }
  }, [isLoggedIn, isCheckingLogin, navigate]);

  // 자동 가이드 전환 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGuide((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentGuide]); // currentGuide가 바뀔 때마다 타이머 재시작

  // 가이드 변경 시 애니메이션 재시작
  useEffect(() => {
    setProgressKey(prev => prev + 1);
  }, [currentGuide]);

  const handleLogin = () => {
    kakaoLogin();
  };

  // 로그인 상태 체크 중이면 로딩 표시
  if (isCheckingLogin) {
    return (
      <PageWrapper 
        className="App" 
        backgroundImage={background} 
        isLoading={true} 
        loadingText="로그인 상태 확인 중..."
      />
    );
  }

  const handleDotClick = (index) => {
    if (index !== currentGuide) {
      setCurrentGuide(index);
      // currentGuide가 바뀌면 useEffect에서 자동으로 타이머와 애니메이션이 재시작됨
    }
  };

  return (
    <PageWrapper className="App" backgroundImage={background}>
      <div className="content-wrapper">
        <img src={logo} alt="DrawCen Logo" className="logo logo-animate" />
        <div className="main-container container-animate">
          <div className="container-inner">
            <div className="left-section">
              <div className="main-text">단어를 그림으로 표현하고 맞히는<br />그림 퀴즈 게임!</div>
              <div className="main-text">로그인 후, 바로시작!</div>
              <img 
                src={loginBtn} 
                alt="Login" 
                className="login-button"
                onClick={handleLogin}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div className="right-section">
              <div className="play-method">
                <svg className="play-method-svg" width="200" height="50">
                  <defs>
                    <linearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop className="gradient-start" offset="0%" />
                      <stop className="gradient-end" offset="100%" />
                    </linearGradient>
                  </defs>
                  <text className="play-method-text" x="50%" y="50%">
                    플레이 방법
                  </text>
                </svg>
                <div className="play-guide-container">
                  <img 
                    src={guideImages[currentGuide]} 
                    alt={`Play Guide ${currentGuide + 1}`} 
                    className="play-guide" 
                  />
                </div>
                <p className="play-guide-text">{guideTexts[currentGuide]}</p>
                <div className="method-indicators">
                  {[0, 1, 2, 3].map((index) => (
                    <div 
                      key={index} 
                      className={`dot-container ${currentGuide === index ? 'active' : ''}`}
                      onClick={() => handleDotClick(index)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        {currentGuide === index && (
                          <circle
                            key={progressKey} // 애니메이션 재시작용 키
                            className="progress-ring"
                            stroke="url(#progress-gradient)"
                            strokeWidth="2"
                            fill="none"
                            r="10"
                            cx="12"
                            cy="12"
                          />
                        )}
                        <circle
                          className="dot-circle"
                          fill={currentGuide === index ? "white" : "rgba(255, 255, 255, 0.3)"}
                          r="4"
                          cx="12"
                          cy="12"
                        />
                        
                        {/* 그라데이션 정의 */}
                        <defs>
                          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#45D3FF" />
                            <stop offset="100%" stopColor="#CF83FF" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default LandingPage; 