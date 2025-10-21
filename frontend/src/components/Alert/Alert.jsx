import React from 'react';
import Icon from '../../utils/iconMapping.jsx';
import './Alert.css';

export default function Alert({ 
  type = 'info', 
  message, 
  onClose, 
  autoClose = false, 
  duration = 5000,
  className = '' 
}) {
  
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getAlertClass = () => {
    const baseClass = 'alert';
    const typeClass = `alert-${type}`;
    return `${baseClass} ${typeClass} ${className}`.trim();
  };

  if (!message) return null;

  return (
    <div className={getAlertClass()}>
      <div className="alert-content">
        <Icon emoji={getIcon()} size={16} />
        <span className="alert-message">{message}</span>
      </div>
      {onClose && (
        <button 
          className="alert-close" 
          onClick={onClose}
          aria-label="Fechar alerta"
        >
          <Icon emoji="✕" size={14} />
        </button>
      )}
    </div>
  );
} 