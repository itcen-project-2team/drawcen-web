import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicStore } from '../../stores/musicStore';
import useUserStore from '../../stores/userStore';
import { logout } from '../../services/userService';
import styles from './SettingsDropdown.module.css';

const SettingsDropdown = ({ showInGame = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { deleteUser } = useUserStore();
  const { isMuted, toggleMute, isLoaded } = useMusicStore();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMusicToggle = () => {
    if (isLoaded) {
      toggleMute();
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      deleteUser();
      navigate('/');
    } catch (error) {
      deleteUser();
      navigate('/');
    }
    setIsOpen(false);
  };

  const handleMainPageNavigation = () => {
    navigate('/main');
    setIsOpen(false);
  };

  return (
    <div className={styles.settingsDropdown} ref={dropdownRef}>
      <button className={styles.settingsButton} onClick={handleToggleDropdown}>
        <span className={styles.settingsIcon}>⚙️</span>
        <span className={styles.settingsText}>설정</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {isLoaded && (
            <button className={styles.dropdownItem} onClick={handleMusicToggle}>
              <span className={styles.itemIcon}>🎵</span>
              <span className={styles.itemText}>
                음악 {isMuted ? '켜기' : '끄기'}
              </span>
            </button>
          )}
          
          <button className={styles.dropdownItem} onClick={handleLogout}>
            <span className={styles.itemIcon}>🚪</span>
            <span className={styles.itemText}>로그아웃</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown; 