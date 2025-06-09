// 프로필 이미지 import
import profileWhite from '../assets/profile_white.png';
import profileBlue from '../assets/profile_blue.png';
import profileBabypink from '../assets/profile_babypink.png';
import profileOrange from '../assets/profile_orange.png';
import profileYellow from '../assets/profile_yellow.png';
import profileHidden from '../assets/profile_hidden.png';
import profileHotpink from '../assets/profile_hotpink.png';
import profilePurple from '../assets/profile_purple.png';
import profileLime from '../assets/profile_lime.png';
import defaultAvatar from '../assets/default-avatar.png';

// profileColor와 이미지 매핑 객체
const PROFILE_IMAGE_MAP = {
  WHITE: profileWhite,
  BLUE: profileBlue,
  BABYPINK: profileBabypink,
  ORANGE: profileOrange,
  YELLOW: profileYellow,
  HIDDEN: profileHidden,
  HOTPINK: profileHotpink,
  PURPLE: profilePurple,
  LIME: profileLime
};

// 사용 가능한 프로필 컬러 목록
export const PROFILE_COLORS = [
  'WHITE',
  'BLUE', 
  'BABYPINK',
  'ORANGE',
  'YELLOW',
  'HIDDEN',
  'HOTPINK',
  'PURPLE',
  'LIME'
];

/**
 * profileColor에 따른 프로필 이미지를 반환하는 함수
 * @param {string} profileColor - 프로필 컬러 (WHITE, BLUE, BABYPINK 등)
 * @returns {string} 프로필 이미지 경로
 */
export const getProfileImage = (profileColor) => {
  if (!profileColor || typeof profileColor !== 'string') {
    return defaultAvatar;
  }
  
  const upperCaseColor = profileColor.toUpperCase();
  return PROFILE_IMAGE_MAP[upperCaseColor] || defaultAvatar;
};

/**
 * profileColor가 유효한지 확인하는 함수
 * @param {string} profileColor - 확인할 프로필 컬러
 * @returns {boolean} 유효성 여부
 */
export const isValidProfileColor = (profileColor) => {
  return PROFILE_COLORS.includes(profileColor?.toUpperCase());
};

/**
 * 사용자 객체에서 프로필 이미지를 추출하는 함수
 * @param {object} user - 사용자 객체 (profileColor 포함)
 * @returns {string} 프로필 이미지 경로
 */
export const getUserProfileImage = (user) => {
  if (!user) return defaultAvatar;
  return getProfileImage(user.profileColor);
};

export default getProfileImage; 