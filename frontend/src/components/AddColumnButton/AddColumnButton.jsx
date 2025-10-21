import React from 'react';

export default function AddColumnButton({ onClick }) {
  return (
    <button className="add-column-btn" onClick={onClick}>
      + Adicionar Coluna
    </button>
  );
} 