import React from 'react';
import Icon from '../../utils/iconMapping.jsx';
import KanbanCard from '../KanbanCard/KanbanCard';

export default function KanbanColumn({ column, onEditColumn, onRemoveColumn, onAddCard, onEditCard, onDeleteCard, onDragOver, onDragLeave, onDrop, dragOverColumn, getPriorityColor, handleDragStart, handleDragEnd, onColumnDragStart, onColumnDragEnd, onColumnDragOver, onColumnDrop, draggedColumn, dragOverColumnPosition }) {
  return (
    <div 
      className={`kanban-column${dragOverColumn === column.id ? ' drag-over' : ''}${draggedColumn === column.id ? ' column-dragging' : ''}${dragOverColumnPosition === column.position ? ' column-drag-over' : ''}`}
      onDragOver={e => onDragOver(e, column.id)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, column.id)}
      draggable
      onDragStart={e => onColumnDragStart(e, column)}
      onDragEnd={onColumnDragEnd}
    >
      <div 
        className="column-header"
        onDragOver={e => onColumnDragOver(e, column.position)}
        onDrop={e => onColumnDrop(e, column.position)}
      >
        <div className="column-title-container">
          <div className="column-drag-handle" title="Arraste para reordenar coluna">
            <Icon emoji="⋮⋮" />
          </div>
          <h3>{column.name}</h3>
          <div className="column-actions">
            <button className="column-btn edit-btn" onClick={() => onEditColumn(column)} title="Editar coluna"><Icon emoji="✏️" /></button>
            <button className="column-btn delete-btn" onClick={() => onRemoveColumn(column.id)} title="Excluir coluna"><Icon emoji="🗑️" /></button>
          </div>
        </div>
      </div>
      <div className="cards-container">
        {column.cards.map(card => (
          <KanbanCard
            key={card.id}
            card={card}
            columnId={column.id}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
            getPriorityColor={getPriorityColor}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
          />
        ))}
        <button className="add-card-btn" onClick={() => onAddCard(column.id)}>
          + Adicionar cartão
        </button>
      </div>
    </div>
  );
} 