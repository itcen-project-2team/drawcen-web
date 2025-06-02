import React from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  showCloseButton = true, 
  className = '',
  style = {}
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${className}`} 
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal; 