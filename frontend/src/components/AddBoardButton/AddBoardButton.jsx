import React from 'react';

export default function AddBoardButton({ onClick }) {
  return (
    <button className="add-board-btn" onClick={onClick}>
      + Adicionar Quadro
    </button>
  );
} 