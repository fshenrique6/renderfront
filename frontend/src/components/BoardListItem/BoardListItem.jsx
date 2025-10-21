import React from "react";
import Icon from '../../utils/iconMapping.jsx';

export default function BoardListItem({ board, active, selectBoard, openDeleteBoardModal }) {
  return (
    <div className="board-item">
      <button 
        className={`board-btn${active ? ' active' : ''}`}
        onClick={() => selectBoard(board.id)}
      >
        {board.name}
      </button>
      <button 
        className="delete-board-btn"
        onClick={e => openDeleteBoardModal(e, board)}
        title="Excluir quadro"
      >
        <Icon emoji="🗑️" />
      </button>
    </div>
  );
} 