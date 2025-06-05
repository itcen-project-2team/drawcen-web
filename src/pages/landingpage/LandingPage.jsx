import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import PageWrapper from '../../components/PageWrapper/PageWrapper';
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
  
  // useUserStore에서 필요한 함수들 가져오기
  const { setUser, isLoggedIn } = useUserStore();
  
  const guideImages = [playGuide1, playGuide2, playGuide3, playGuide4];
  const guideTexts = [
    "안녕하세요111안녕하세요안녕하세요안녕하세요",
    "안녕하세요2222안녕하세요안녕하세요안녕하세요",
    "안녕하세요3333안녕하세요안녕하세요안녕하세요안녕하세요",
    "안녕하세요4444안녕하세요안녕하세요안녕하세요안녕하세요"
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGuide((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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
    setCurrentGuide(index);
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
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        {currentGuide === index && (
                          <circle
                            className="progress-ring"
                            stroke="white"
                            strokeWidth="2"
                            fill="none"
                            r="8"
                            cx="10"
                            cy="10"
                          />
                        )}
                        <circle
                          className="dot-circle"
                          fill={currentGuide === index ? "white" : "rgba(255, 255, 255, 0.5)"}
                          r="6"
                          cx="10"
                          cy="10"
                        />
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