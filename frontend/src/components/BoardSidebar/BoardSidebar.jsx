import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../utils/iconMapping.jsx';
import BoardListItem from '../BoardListItem/BoardListItem';
import AddBoardButton from '../AddBoardButton/AddBoardButton';
import apiService from '../../services/api';
import Logo from '../../assets/logodegrade.png';

export default function BoardSidebar({ boards, activeBoardId, selectBoard, openDeleteBoardModal, setIsBoardModalOpen }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      // Se não conseguir carregar do servidor, usar dados locais
      const localUser = apiService.getUser();
      if (localUser) {
        setUser(localUser);
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate('/kanban');
  };

  const handleLogout = () => {
    apiService.logout();
    navigate('/');
  };

  const handleMyAccount = () => {
    setIsUserDropdownOpen(false);
    navigate('/profile');
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.sidebar-user-dropdown-container');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="kanban-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-img">
         <img src={Logo} alt="" style={{ width: '100%' }} />
        </div>     
      </div>

      <div className="boards-section-sidebar">
        <p className="section-title">Meus quadros:</p>
        {boards.length === 0 ? (
          <p className="no-boards">Nenhum quadro criado</p>
        ) : (
          boards.map(board => (
            <BoardListItem
              key={board.id}
              board={board}
              active={activeBoardId === board.id}
              selectBoard={selectBoard}
              openDeleteBoardModal={openDeleteBoardModal}
            />
          ))
        )}
        <AddBoardButton onClick={() => setIsBoardModalOpen(true)} />
      </div>
      
      {/* Botão para voltar ao dashboard */}
      <button className="back-dashboard-btn" onClick={handleBackToDashboard}>
        <span><Icon emoji="📊" /></span> Dashboard
      </button>

      {/* Seção do usuário */}
      <div className="sidebar-user-section">
        <div className="sidebar-user-dropdown-container">
          <button className={`sidebar-user-profile-btn ${user?.photo ? 'has-photo' : ''}`} onClick={toggleUserDropdown}>
            {user?.photo ? (
              <img 
                src={user.photo} 
                alt="Foto do perfil" 
                className="sidebar-user-avatar"
              />
            ) : (
              <div className="sidebar-user-placeholder">
                <Icon emoji="👤" size={24} color="white" />
              </div>
            )}
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'Usuário'}</span>
              <span className="sidebar-user-email">{user?.email || ''}</span>
            </div>
            <Icon emoji="⚙️" size={16} color="rgba(255, 255, 255, 0.6)" />
          </button>
          
          {isUserDropdownOpen && (
            <div className="sidebar-user-dropdown-menu">
              <div className="sidebar-dropdown-item" onClick={handleMyAccount}>
                <span className="sidebar-item-icon"><Icon emoji="⚙️" /></span>
                <span>Minha Conta</span>
              </div>
              <div className="sidebar-dropdown-separator"></div>
              <div className="sidebar-dropdown-item sidebar-logout-item" onClick={handleLogout}>
                <span className="sidebar-item-icon"><Icon emoji="🚪" /></span>
                <span>Sair</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 