import React from 'react';

export default function EditColumnModal({ isOpen, columnName, setColumnName, onClose, onSave }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-form-container">
        <h2>Editar Coluna</h2>
        <form className="card-form" onSubmit={e => { e.preventDefault(); onSave(e); }}>
          <div className="form-group">
            <input
              type="text"
              value={columnName}
              onChange={e => setColumnName(e.target.value)}
              placeholder="Nome da coluna"
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