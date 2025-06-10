import React, { useEffect } from 'react';
import { useMusicStore } from '../../stores/musicStore';
import './MusicControl.css';

const MusicControl = () => {
  const { isMuted, isLoaded, toggleMute, getDebugInfo } = useMusicStore();

  useEffect(() => {
    console.log('🎵 MusicControl 컴포넌트 마운트');
    console.log('🎵 초기 상태:', getDebugInfo());
    
    return () => {
      console.log('🎵 MusicControl 컴포넌트 언마운트');
    };
  }, [getDebugInfo]);

  useEffect(() => {
    console.log('🎵 상태 변경:', { isMuted, isLoaded });
  }, [isMuted, isLoaded]);

  const handleToggleClick = () => {
    console.log('🎵 버튼 클릭 - 현재 상태:', { isMuted, isLoaded });
    toggleMute();
  };

  if (!isLoaded) {
    console.log('🎵 컴포넌트 숨김 - 로딩 중');
    return null; // 로딩 중에는 표시하지 않음
  }

  console.log('🎵 컴포넌트 렌더링:', { isMuted, isLoaded });

  return (
    <div className="music-toggle-button">
      <button 
        className={`music-btn ${!isMuted ? 'active' : ''}`}
        onClick={handleToggleClick}
        title={isMuted ? '음악 켜기' : '음악 끄기'}
      >
        <div className="music-icon">
          🎵
        </div>
      </button>
    </div>
  );
};

export default MusicControl; 