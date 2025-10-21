import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../utils/iconMapping.jsx';
import './Kanban.css';
import BoardSidebar from '../BoardSidebar/BoardSidebar';      
import KanbanHeader from '../KanbanHeader/KanbanHeader';      
import KanbanColumn from '../KanbanColumn/KanbanColumn';      
import DeleteModal from '../DeleteModal/DeleteModal';        
import EditColumnModal from '../EditColumnModal/EditColumnModal';  
import EditBoardModal from '../EditBoardModal/EditBoardModal';      
import CardModal from '../CardModal/CardModal';
import apiService from '../../services/api';
import { nameToSlug, findBoardBySlug } from '../../utils/urlUtils';

function Kanban() {
    const navigate = useNavigate();
    const { boardName: boardSlug } = useParams();
    
    const [boards, setBoards] = useState([]);
    const [activeBoardId, setActiveBoardId] = useState(null);
    const [activeBoard, setActiveBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [boardName, setBoardName] = useState('');

    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState(null);
    const [editingCard, setEditingCard] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);

    const [isDeleteBoardModalOpen, setIsDeleteBoardModalOpen] = useState(false);
    const [boardToDelete, setBoardToDelete] = useState(null);

    const [draggedCard, setDraggedCard] = useState(null);
    const [draggedFromColumn, setDraggedFromColumn] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const [draggedColumn, setDraggedColumn] = useState(null);
    const [dragOverColumnPosition, setDragOverColumnPosition] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'media'
    });

    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState(null);
    const [columnName, setColumnName] = useState('');
    const [isDeleteColumnModalOpen, setIsDeleteColumnModalOpen] = useState(false);
    const [columnToDelete, setColumnToDelete] = useState(null);

    const [isEditingBoardName, setIsEditingBoardName] = useState(false);
    const [editBoardName, setEditBoardName] = useState('');

    useEffect(() => {
        loadBoards();
    }, []);

    useEffect(() => {
        if (boardSlug && boards.length > 0) {
            const board = findBoardBySlug(boards, boardSlug);
            if (board) {
                setActiveBoardId(board.id);
            } else {
                if (boards.length > 0) {
                    const firstBoardSlug = nameToSlug(boards[0].name);
                    navigate(`/kanban/${firstBoardSlug}`, { replace: true });
                } else {
                    navigate('/kanban', { replace: true });
                }
            }
        } else if (!boardSlug && boards.length > 0) {
            const firstBoardSlug = nameToSlug(boards[0].name);
            navigate(`/kanban/${firstBoardSlug}`, { replace: true });
        }
    }, [boardSlug, boards, navigate]);

    useEffect(() => {
        if (activeBoardId) {
            loadActiveBoard();
        } else {
            setActiveBoard(null);
        }
    }, [activeBoardId]);

    const loadBoards = async () => {
        try {
            setLoading(true);
            setError(null);
            const boardsData = await apiService.getBoards();
            setBoards(boardsData);
        } catch (err) {
            console.error('Erro ao carregar boards:', err);
            setError('Erro ao carregar quadros. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const loadActiveBoard = async () => {
        try {
            setError(null);
            const boardData = await apiService.getBoard(activeBoardId);
            setActiveBoard(boardData);
        } catch (err) {
            console.error('Erro ao carregar board:', err);
            setError('Erro ao carregar quadro. Tente novamente.');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'alta': return '#ef4444';
            case 'media': return '#f59e0b';
            case 'baixa': return '#10b981';
            default: return '#6b7280';
        }
    };

    const handleLogout = () => {
        apiService.logout();
        navigate('/');
    };

    const createBoard = async (e) => {
        e.preventDefault();
        
        if (!boardName.trim()) {
            alert('Por favor, digite um nome para o quadro.');
            return;
        }

        try {
            const newBoard = await apiService.createBoard(boardName);
            setBoards(prev => [...prev, newBoard]);
            
            setBoardName('');
            setIsBoardModalOpen(false);
            
            const slug = nameToSlug(newBoard.name);
            navigate(`/kanban/${slug}`);
        } catch (err) {
            console.error('Erro ao criar board:', err);
            alert('Erro ao criar quadro. Tente novamente.');
        }
    };

    const selectBoard = (boardId) => {
        const board = boards.find(b => b.id === boardId);
        if (board) {
            const slug = nameToSlug(board.name);
            navigate(`/kanban/${slug}`);
        }
    };

    const openDeleteBoardModal = (e, board) => {
        e.stopPropagation();
        setBoardToDelete(board);
        setIsDeleteBoardModalOpen(true);
    };

    const closeDeleteBoardModal = () => {
        setIsDeleteBoardModalOpen(false);
        setBoardToDelete(null);
    };

    const confirmDeleteBoard = async () => {
        if (!boardToDelete) return;

        try {
            const success = await apiService.deleteBoard(boardToDelete.id);
            if (success) {
                const updatedBoards = boards.filter(board => board.id !== boardToDelete.id);
                setBoards(updatedBoards);
                
                if (activeBoardId === boardToDelete.id) {
                    if (updatedBoards.length > 0) {
                        const firstBoardSlug = nameToSlug(updatedBoards[0].name);
                        navigate(`/kanban/${firstBoardSlug}`, { replace: true });
                    } else {
                        navigate('/kanban', { replace: true });
                    }
                }
            } else {
                alert('Erro ao excluir quadro. Tente novamente.');
            }
        } catch (err) {
            console.error('Erro ao excluir board:', err);
            alert('Erro ao excluir quadro. Tente novamente.');
        }

        closeDeleteBoardModal();
    };

    const openCardModal = (columnId) => {
        setSelectedColumnId(columnId);
        setEditingCard(null);
        setFormData({
            title: '',
            description: '',
            priority: 'media'
        });
        setIsCardModalOpen(true);
    };

    const openEditModal = (columnId, card) => {
        setSelectedColumnId(columnId);
        setEditingCard(card);
        setFormData({
            title: card.title,
            description: card.description || '',
            priority: card.priority?.toLowerCase() || 'media'
        });
        setIsCardModalOpen(true);
    };

    const closeCardModal = () => {
        setIsCardModalOpen(false);
        setSelectedColumnId(null);
        setEditingCard(null);
        setFormData({
            title: '',
            description: '',
            priority: 'media'
        });
    };

    const openDeleteModal = (columnId, cardId, cardTitle) => {
        setCardToDelete({ columnId, cardId, cardTitle });
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCardToDelete(null);
    };

    const confirmDelete = async () => {
        if (!cardToDelete || !activeBoard) return;

        try {
            const success = await apiService.removeCard(activeBoard.id, cardToDelete.columnId, cardToDelete.cardId);
            if (success) {
                await loadActiveBoard();
            } else {
                alert('Erro ao excluir cartão. Tente novamente.');
            }
        } catch (err) {
            console.error('Erro ao excluir card:', err);
            alert('Erro ao excluir cartão. Tente novamente.');
        }

        closeDeleteModal();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveCard = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            alert('Por favor, digite um título para o cartão.');
            return;
        }

        if (!activeBoard || !selectedColumnId) return;

        try {
            if (editingCard) {
                await apiService.updateCard(
                    activeBoard.id,
                    selectedColumnId,
                    editingCard.id,
                    formData.title,
                    formData.description,
                    formData.priority
                );
            } else {
                await apiService.addCard(
                    activeBoard.id,
                    selectedColumnId,
                    formData.title,
                    formData.description,
                    formData.priority
                );
            }

            await loadActiveBoard();
            closeCardModal();
        } catch (err) {
            console.error('Erro ao salvar card:', err);
            alert('Erro ao salvar cartão. Tente novamente.');
        }
    };

    const handleDragStart = (e, card, columnId) => {
        setDraggedCard(card);
        setDraggedFromColumn(columnId);
    };

    const handleDragEnd = () => {
        setDraggedCard(null);
        setDraggedFromColumn(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDragLeave = (e) => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e, targetColumnId) => {
        e.preventDefault();
        
        if (!draggedCard || !activeBoard) return;

        if (draggedFromColumn === targetColumnId) {
            handleDragEnd();
            return;
        }

        try {
            await apiService.moveCard(activeBoard.id, draggedCard.id, targetColumnId);
            await loadActiveBoard();
        } catch (err) {
            console.error('Erro ao mover card:', err);
            alert('Erro ao mover cartão. Tente novamente.');
        }
        
        handleDragEnd();
    };

    const handleColumnDragStart = (e, column) => {
        setDraggedColumn(column.id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.dataTransfer.setData('text/plain', column.name);
    };

    const handleColumnDragEnd = () => {
        setDraggedColumn(null);
        setDragOverColumnPosition(null);
    };

    const handleColumnDragOver = (e, position) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedColumn) {
            setDragOverColumnPosition(position);
        }
    };

    const handleColumnDrop = async (e, targetPosition) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggedColumn || !activeBoard) return;

        const draggedColumnData = activeBoard.columns.find(col => col.id === draggedColumn);
        if (!draggedColumnData || draggedColumnData.position === targetPosition) {
            handleColumnDragEnd();
            return;
        }

        try {
            await apiService.reorderColumn(activeBoard.id, draggedColumn, targetPosition);
            await loadActiveBoard();
        } catch (err) {
            console.error('Erro ao reordenar coluna:', err);
            alert('Erro ao reordenar coluna. Tente novamente.');
        }
        
        handleColumnDragEnd();
    };

    const addColumn = async () => {
        if (!activeBoard) return;

        try {
            await apiService.addColumn(activeBoard.id, 'Nova Coluna');
            await loadActiveBoard();
        } catch (err) {
            console.error('Erro ao adicionar coluna:', err);
            alert('Erro ao adicionar coluna. Tente novamente.');
        }
    };

    const openEditColumnModal = (column) => {
        setEditingColumn(column);
        setColumnName(column.name);
        setIsColumnModalOpen(true);
    };

    const closeColumnModal = () => {
        setIsColumnModalOpen(false);
        setEditingColumn(null);
        setColumnName('');
    };

    const saveColumn = async (e) => {
        e.preventDefault();
        
        if (!columnName.trim()) {
            alert('Por favor, digite um nome para a coluna.');
            return;
        }

        if (!activeBoard || !editingColumn) return;

        try {
            await apiService.updateColumn(activeBoard.id, editingColumn.id, columnName);
            await loadActiveBoard();
            closeColumnModal();
        } catch (err) {
            console.error('Erro ao atualizar coluna:', err);
            alert('Erro ao atualizar coluna. Tente novamente.');
        }
    };

    const removeColumn = (columnId) => {
        setColumnToDelete(columnId);
        setIsDeleteColumnModalOpen(true);
    };

    const confirmDeleteColumn = async () => {
        if (!columnToDelete || !activeBoard) return;

        try {
            const success = await apiService.removeColumn(activeBoard.id, columnToDelete);
            if (success) {
                await loadActiveBoard();
            } else {
                alert('Erro ao excluir coluna. Tente novamente.');
            }
        } catch (err) {
            console.error('Erro ao excluir coluna:', err);
            alert('Erro ao excluir coluna. Tente novamente.');
        }

        setIsDeleteColumnModalOpen(false);
        setColumnToDelete(null);
    };

    const openEditBoardName = () => {
        if (activeBoard) {
            setEditBoardName(activeBoard.name);
            setIsEditingBoardName(true);
        }
    };

    const cancelEditBoardName = () => {
        setIsEditingBoardName(false);
        setEditBoardName('');
    };

    const saveBoardName = async () => {
        if (!editBoardName.trim()) {
            alert('Por favor, digite um nome para o quadro.');
            return;
        }

        if (!activeBoard) return;

        try {
            await apiService.updateBoard(activeBoard.id, editBoardName);
            await loadActiveBoard();
            await loadBoards();
            setIsEditingBoardName(false);
            setEditBoardName('');
            
            const newSlug = nameToSlug(editBoardName);
            navigate(`/kanban/${newSlug}`, { replace: true });
        } catch (err) {
            console.error('Erro ao atualizar nome do board:', err);
            alert('Erro ao atualizar nome do quadro. Tente novamente.');
        }
    };

    if (loading) {
        return (
            <div className="kanban-container">
                <div className="loading-state">
                    <div className="loading-content">
                        <div className="loading-spinner"><Icon emoji="⏳" size={32} /></div>
                        <h2>Carregando seus quadros...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="kanban-container">
                <div className="error-state">
                    <div className="error-content">
                        <div className="error-icon"><Icon emoji="❌" size={32} /></div>
                        <h2>Erro ao carregar dados</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button 
                                className="btn-secondary"
                                onClick={() => navigate('/dashboard')}
                            >
                                <Icon emoji="📊" size={16} /> Voltar ao Dashboard
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                <Icon emoji="🔄" size={16} /> Tentar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="kanban-container">
            <BoardSidebar
                boards={boards}
                activeBoardId={activeBoardId}
                selectBoard={selectBoard}
                openDeleteBoardModal={openDeleteBoardModal}
                setIsBoardModalOpen={setIsBoardModalOpen}
            />

            <div className="kanban-main">
                {!activeBoard ? (
                    <div className="empty-state">
                        <div className="empty-content">
                            <div className="empty-icon"><Icon emoji="📋" size={48} /></div>
                            <h2>Bem-vindo ao ServiTask!</h2>
                            <p>Crie seu primeiro quadro para começar a organizar suas tarefas.</p>
                            <button 
                                className="btn-primary large"
                                onClick={() => setIsBoardModalOpen(true)}
                            >
                                + Criar Primeiro Quadro
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <KanbanHeader 
                            boardName={activeBoard.name} 
                            onAddColumn={addColumn}
                            onEditBoardName={openEditBoardName}
                            isEditingBoardName={isEditingBoardName}
                            editBoardName={editBoardName}
                            setEditBoardName={setEditBoardName}
                            onSaveBoardName={saveBoardName}
                            onCancelEditBoardName={cancelEditBoardName}
                        />
                        
                        <div className="kanban-board">
                            {activeBoard.columns && activeBoard.columns.map(column => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    onEditColumn={openEditColumnModal}
                                    onRemoveColumn={removeColumn}
                                    onAddCard={openCardModal}
                                    onEditCard={openEditModal}
                                    onDeleteCard={openDeleteModal}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    dragOverColumn={dragOverColumn}
                                    getPriorityColor={getPriorityColor}
                                    handleDragStart={handleDragStart}
                                    handleDragEnd={handleDragEnd}
                                    onColumnDragStart={handleColumnDragStart}
                                    onColumnDragEnd={handleColumnDragEnd}
                                    onColumnDragOver={handleColumnDragOver}
                                    onColumnDrop={handleColumnDrop}
                                    draggedColumn={draggedColumn}
                                    dragOverColumnPosition={dragOverColumnPosition}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <EditBoardModal
                isOpen={isBoardModalOpen}
                boardName={boardName}
                setBoardName={setBoardName}
                onClose={() => setIsBoardModalOpen(false)}
                onSave={createBoard}
            />
            <EditColumnModal
                isOpen={isColumnModalOpen}
                columnName={columnName}
                setColumnName={setColumnName}
                onClose={closeColumnModal}
                onSave={saveColumn}
            />
            <CardModal
                isOpen={isCardModalOpen}
                formData={formData}
                setFormData={setFormData}
                onClose={closeCardModal}
                onSave={saveCard}
                editingCard={editingCard}
                handleInputChange={handleInputChange}
            />
            <DeleteModal
                isOpen={isDeleteBoardModalOpen && !!boardToDelete}
                onClose={closeDeleteBoardModal}
                onConfirm={confirmDeleteBoard}
                title="Confirmar Exclusão do Quadro"
                itemName={boardToDelete?.name}
                warning="Esta ação irá excluir permanentemente o quadro e todos os seus cartões. Esta ação não pode ser desfeita."
                confirmLabel="Excluir Quadro"
                icon="🗑️"
            />
            <DeleteModal
                isOpen={isDeleteColumnModalOpen && columnToDelete !== null}
                onClose={() => { setIsDeleteColumnModalOpen(false); setColumnToDelete(null); }}
                onConfirm={confirmDeleteColumn}
                title="Confirmar Exclusão da Coluna"
                itemName={activeBoard?.columns?.find(col => col.id === columnToDelete)?.name || ''}
                warning="Esta ação irá excluir permanentemente a coluna e todos os seus cartões. Esta ação não pode ser desfeita."
                confirmLabel="Excluir Coluna"
                icon="🗑️"
            />
            <DeleteModal
                isOpen={isDeleteModalOpen && !!cardToDelete}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                itemName={cardToDelete?.cardTitle}
                warning="Esta ação não pode ser desfeita."
                confirmLabel="Excluir Cartão"
                icon="🗑️"
            />
        </div>
    );
}

export default Kanban; 