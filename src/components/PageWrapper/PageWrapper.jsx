import React from 'react';
import '../../styles/pageTransition.css';

const PageWrapper = ({ children, className = "", backgroundImage = null, isLoading = false, loadingText = "로딩 중..." }) => {
  if (isLoading) {
    return (
      <div 
        className={`loading-screen ${className}`} 
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}
      >
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div className="loading-text">{loadingText}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`page-wrapper ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}
    >
      {children}
    </div>
  );
};

export default PageWrapper; 