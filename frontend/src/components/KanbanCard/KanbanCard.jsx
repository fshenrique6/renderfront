import React from 'react';
import Icon from '../../utils/iconMapping.jsx';

export default function KanbanCard({ card, columnId, onEditCard, onDeleteCard, getPriorityColor, handleDragStart, handleDragEnd }) {
  return (
    <div
      className="kanban-card"
      data-priority={card.priority}
      draggable
      onDragStart={e => handleDragStart(e, card, columnId)}
      onDragEnd={handleDragEnd}
    >
      <div className="card-header">
        <h4>{card.title}</h4>
        <div className="priority-indicator" style={{ backgroundColor: getPriorityColor(card.priority) }}></div>
      </div>
      <p className="card-description">{card.description}</p>
      <div className="card-footer">
        <span className="priority-tag" style={{ color: getPriorityColor(card.priority) }}>
          {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
        </span>
        <div className="card-actions">
          <button className="card-btn edit-btn" onClick={e => { e.stopPropagation(); onEditCard(columnId, card); }} title="Editar cartão"><Icon emoji="✏️" /></button>
          <button className="card-btn delete-btn" onClick={e => { e.stopPropagation(); onDeleteCard(columnId, card.id, card.title); }} title="Excluir cartão"><Icon emoji="🗑️" /></button>
        </div>
      </div>
    </div>
  );
} 