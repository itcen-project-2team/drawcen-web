import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'icon'
  size = 'medium', // 'small', 'medium', 'large'
  shape = 'rounded', // 'rounded', 'circle'
  onClick,
  disabled = false,
  className = '',
  style = {},
  ...props
}) => {
  const buttonClass = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    `btn-${shape}`,
    disabled ? 'btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      style={style}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 