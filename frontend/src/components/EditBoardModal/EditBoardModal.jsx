import React from 'react';

export default function EditBoardModal({ isOpen, boardName, setBoardName, onClose, onSave }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-form-container">
        <h2>Criar Novo Quadro</h2>
        <form className="card-form" onSubmit={e => { e.preventDefault(); onSave(e); }}>
          <div className="form-group">
            <input
              type="text"
              value={boardName}
              onChange={e => setBoardName(e.target.value)}
              placeholder="Nome do quadro"
              className="modal-input"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
} 