import React, { useEffect, useState } from 'react';
import styles from './CorrectAnimation.module.css';

const CorrectAnimation = ({ onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트되면 애니메이션 시작
    setIsVisible(true);
    
    // 2.5초 후 애니메이션 완료 콜백 호출
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.correctAnimationOverlay}>
      <div className={styles.correctText}>
        정답입니다!
      </div>
    </div>
  );
};

export default CorrectAnimation; 