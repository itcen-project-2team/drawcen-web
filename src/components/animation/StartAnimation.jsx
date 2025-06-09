import React, { useEffect, useState } from 'react';
import styles from './StartAnimation.module.css';

const StartAnimation = ({ onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트되면 애니메이션 시작
    setIsVisible(true);
    
    // 3초 후 애니메이션 완료 콜백 호출
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.startAnimationOverlay}>
      <div className={styles.startText}>
        START!
      </div>
    </div>
  );
};

export default StartAnimation; 