import React from 'react';
import { Icon } from '../../utils/iconMapping';

function getPriorityIcon(priority) {
  let color = '#10b981', letter = 'B';
  if (priority === 'media') { color = '#f59e0b'; letter = 'M'; }
  if (priority === 'alta') { color = '#ef4444'; letter = 'A'; }
  return (
    <span className="priority-circle" style={{ background: color }}>
      {letter}
    </span>
  );
}

export default function CardModal({ isOpen, formData, setFormData, onClose, onSave, editingCard }) {
  if (!isOpen) return null;
  
  const isEditing = !!editingCard;
  const maxDescriptionLength = 100;
  const currentDescriptionLength = formData.description ? formData.description.length : 0;
  const isDescriptionOverLimit = currentDescriptionLength > maxDescriptionLength;
  
  return (
    <div className="modal-overlay">
      <div className="modal-card-form spaced">
        <div className="modal-header-row">
          <h2>
            <Icon emoji={isEditing ? "✏️" : "➕"} size={20} />
            {isEditing ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <Icon emoji="❌" size={16} />
          </button>
        </div>
        <form className="styled-form" onSubmit={e => { 
          e.preventDefault(); 
          if (isDescriptionOverLimit) {
            return; // Previne envio se descrição exceder limite
          }
          onSave(e); 
        }}>
          <div className="form-group">
            <label htmlFor="title">
              <Icon emoji="📝" size={16} />
              Título *
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do cartão"
              className="styled-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">
              <Icon emoji="📄" size={16} />
              Descrição
            </label>
            <div className="textarea-container">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Digite a descrição do cartão"
                className="styled-input"
                maxLength={maxDescriptionLength + 20} // Permite digitar um pouco mais para mostrar erro
              />
              <div className="char-counter-bottom">
                {currentDescriptionLength} / {maxDescriptionLength}
              </div>
            </div>
            {isDescriptionOverLimit && (
              <div className="simple-error">
                Descrição deve ter no máximo {maxDescriptionLength} caracteres
              </div>
            )}
          </div>
          <div className="form-group priority-group">
            <label htmlFor="priority">
              <Icon emoji="🎯" size={16} />
              Prioridade
            </label>
            <div className="priority-select-wrapper">
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="styled-input"
              >
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              {getPriorityIcon(formData.priority)}
            </div>
          </div>
          <div className="modal-actions-row spaced">
            <button 
              type="submit" 
              className="btn-blue"
              disabled={isDescriptionOverLimit}
            >
              <Icon emoji={isEditing ? "✔️" : "➕"} size={16} />
              {isEditing ? 'Salvar Alterações' : 'Adicionar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 