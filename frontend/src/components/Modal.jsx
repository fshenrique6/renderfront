import React from 'react';
import Icon from '../utils/iconMapping.jsx';
import './Modal.css';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  className = ''
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-content ${className}`}>
        <div className="modal-header">
          <h2 className="modal-title">
            {title}
          </h2>
          {showCloseButton && (
            <button className="modal-close-btn" onClick={onClose}>
              <Icon emoji="✕" size={20} />
            </button>
          )}
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
} 