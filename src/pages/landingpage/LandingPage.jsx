import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import background from '../../assets/background.png';
import logo from '../../assets/logo.png';
import loginBtn from '../../assets/loginbtn.png';
import playGuide1 from '../../assets/playguide-01.png';
import playGuide2 from '../../assets/playguide-02.png';
import playGuide3 from '../../assets/playguide-03.png';
import playGuide4 from '../../assets/playguide-04.png';
import { kakaoLogin } from '../../services/userService';
import useUserStore from '../../stores/userStore';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setUser, isLoggedIn } = useUserStore();
  const [currentGuide, setCurrentGuide] = useState(0);
  
  const guideImages = [playGuide1, playGuide2, playGuide3, playGuide4];
  const guideTexts = [
    "안녕하세요111안녕하세요안녕하세요안녕하세요",
    "안녕하세요2222안녕하세요안녕하세요안녕하세요",
    "안녕하세요3333안녕하세요안녕하세요안녕하세요안녕하세요",
    "안녕하세요4444안녕하세요안녕하세요안녕하세요안녕하세요"
  ];

  // 로그인 상태 확인 후 메인페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/main');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGuide((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    kakaoLogin();
  };

  // 임시 로그인 전역 상태 생성
  const handleTempLogin = () => {
    const tempUser = {
      id: 1,
      username: 'kingdom000603@gmail.com',
      nickname: '최강채원',
      email: 'kingdom000603@gmail.com',
      isLoggedIn: true
    };
    
    setUser(tempUser);
    console.log('임시 로그인 정보:', tempUser);
  };

  const handleDotClick = (index) => {
    setCurrentGuide(index);
  };

  return (
    <div className="App" style={{ backgroundImage: `url(${background})` }}>
      {/* 임시 로그인 버튼 */}
      <button className="temp-login-button" onClick={handleTempLogin}>
        임시 로그인 생성
      </button>
      
      <div className="content-wrapper">
        <img src={logo} alt="DrawCen Logo" className="logo" />
        <div className="main-container">
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
    </div>
  );
};

export default LandingPage; 