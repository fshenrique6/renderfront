import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Carregando...', 
  overlay = false,
  color = 'primary',
  fullScreen = false 
}) {
  
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'spinner-small';
      case 'large':
        return 'spinner-large';
      case 'medium':
      default:
        return 'spinner-medium';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'white':
        return 'spinner-white';
      case 'secondary':
        return 'spinner-secondary';
      case 'primary':
      default:
        return 'spinner-primary';
    }
  };

  const spinner = (
    <div className={`loading-spinner ${getSizeClass()} ${getColorClass()}`}>
      <div className="spinner-circle">
        <div className="spinner-dot spinner-dot-1"></div>
        <div className="spinner-dot spinner-dot-2"></div>
        <div className="spinner-dot spinner-dot-3"></div>
        <div className="spinner-dot spinner-dot-4"></div>
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
} 