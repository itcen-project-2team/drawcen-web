import { create } from 'zustand';

// 로컬스토리지 키
const MUSIC_STORAGE_KEY = 'drawcen_music_state';

// 기본 설정
const DEFAULT_STATE = {
  isPlaying: false,
  volume: 0.5,
  currentTime: 0,
  isMuted: true,
  isLoaded: false,
};

// 로컬스토리지에서 상태 로드
const loadMusicState = () => {
  try {
    const saved = localStorage.getItem(MUSIC_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (error) {
    console.error('음악 상태 로드 실패:', error);
  }
  return DEFAULT_STATE;
};

// 로컬스토리지에 상태 저장
const saveMusicState = (state) => {
  try {
    const stateToSave = {
      isPlaying: state.isPlaying,
      volume: state.volume,
      currentTime: state.currentTime,
      isMuted: state.isMuted,
    };
    localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('음악 상태 저장 실패:', error);
  }
};

export const useMusicStore = create((set, get) => ({
  isMuted: true, // 항상 음소거로 시작
  audio: null,
  isLoaded: false,
  
  // 오디오 객체 설정
  setAudio: (audioElement) => {
    console.log('🎵 오디오 객체 설정');
    set({ audio: audioElement, isLoaded: true });
    
    // 기본 설정
    audioElement.volume = 0.5;
    audioElement.loop = true;
    
    console.log('🎵 오디오 설정 완료 - 음소거 상태로 시작');
  },
  
  // 음소거 토글
  toggleMute: () => {
    const { audio, isMuted } = get();
    const newMutedState = !isMuted;
    
    console.log('🎵 음소거 토글:', isMuted, '->', newMutedState);
    
    if (audio) {
      if (newMutedState) {
        // 음소거 활성화
        audio.pause();
        audio.volume = 0;
        console.log('🎵 음악 일시정지 및 음소거');
      } else {
        // 음소거 해제 - 사용자가 직접 클릭했으므로 재생 가능
        audio.volume = 0.5;
        audio.currentTime = 0; // 처음부터 재생
        
        audio.play().then(() => {
          console.log('✅ 음악 재생 성공 (버튼 클릭)');
        }).catch((error) => {
          console.error('❌ 음악 재생 실패 (버튼 클릭):', error.name, error.message);
        });
        
        console.log('🎵 음악 재생 시도 (버튼 클릭)');
      }
    } else {
      console.warn('🎵 오디오 객체가 없음');
    }
    
    set({ isMuted: newMutedState });
  },
  
  // 디버깅용 상태 출력
  getDebugInfo: () => {
    const state = get();
    return {
      isMuted: state.isMuted,
      isLoaded: state.isLoaded,
      hasAudio: !!state.audio,
      audioReady: state.audio ? state.audio.readyState : 'no audio',
      audioPaused: state.audio ? state.audio.paused : 'no audio',
      audioVolume: state.audio ? state.audio.volume : 'no audio',
    };
  },
})); 