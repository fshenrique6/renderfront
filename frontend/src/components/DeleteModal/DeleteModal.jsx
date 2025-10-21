import React from 'react';
import Icon from '../../utils/iconMapping.jsx';

export default function DeleteModal({ isOpen, onClose, onConfirm, title, itemName, warning, confirmLabel = 'Excluir', icon = '🗑️' }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-icon"><Icon emoji={icon} size={32} /></div>
          <h2>{title}</h2>
        </div>
        <div className="delete-modal-body">
          <p>Tem certeza que deseja excluir:</p>
          <div className="card-to-delete">
            <strong>"{itemName}"</strong>
          </div>
          <p className="warning-text">{warning}</p>
        </div>
        <div className="delete-modal-actions">
          <button type="button" className="btn-cancel-delete" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-confirm-delete" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
} 