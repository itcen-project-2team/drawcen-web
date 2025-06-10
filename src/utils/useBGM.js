import { useEffect, useRef } from 'react';
import { useMusicStore } from '../stores/musicStore';
import backgroundMusic from '../assets/background-music.mp3';

export const useBGM = () => {
  const audioRef = useRef(null);
  const { setAudio } = useMusicStore();

  useEffect(() => {
    console.log('🎵 useBGM 훅 시작');
    
    // 오디오 엘리먼트 생성
    if (!audioRef.current) {
      console.log('🎵 오디오 엘리먼트 생성');
      audioRef.current = new Audio(backgroundMusic);
      audioRef.current.preload = 'auto';
      
      // 오디오 로드 완료 시 스토어 등록
      const handleLoadedData = () => {
        console.log('🎵 오디오 로드 완료');
        setAudio(audioRef.current);
      };
      
      // 이미 로드된 경우
      if (audioRef.current.readyState >= 2) {
        handleLoadedData();
      } else {
        audioRef.current.addEventListener('loadeddata', handleLoadedData, { once: true });
      }
    }

    return () => {
      console.log('🎵 useBGM 정리');
    };
  }, [setAudio]);

  // 디버깅용 - 전역에서 접근 가능하도록
  useEffect(() => {
    window.debugMusicState = () => {
      const store = useMusicStore.getState();
      console.log('🎵 현재 음악 상태:', store.getDebugInfo());
      if (audioRef.current) {
        console.log('🎵 오디오 엘리먼트 상태:', {
          paused: audioRef.current.paused,
          volume: audioRef.current.volume,
          currentTime: audioRef.current.currentTime,
          duration: audioRef.current.duration,
          readyState: audioRef.current.readyState,
          networkState: audioRef.current.networkState,
        });
      }
    };
    
    return () => {
      delete window.debugMusicState;
    };
  }, []);

  return {
    audio: audioRef.current,
  };
};

export default useBGM; 