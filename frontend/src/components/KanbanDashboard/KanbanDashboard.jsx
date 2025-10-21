import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../utils/iconMapping.jsx';
import apiService from '../../services/api';
import { nameToSlug } from '../../utils/urlUtils';
import '../Kanban/Kanban.css';

export default function KanbanDashboard() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBoards: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  const [priorityStats, setPriorityStats] = useState({
    alta: { count: 0, percentage: 0 },
    media: { count: 0, percentage: 0 },
    baixa: { count: 0, percentage: 0 }
  });

  // Estados para filtros
  const [selectedBoardId, setSelectedBoardId] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const boardsData = await apiService.getBoards();
      setBoards(boardsData);
      
      calculateStats(boardsData);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (boardsData) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let priorityCounts = { alta: 0, media: 0, baixa: 0 };

    boardsData.forEach(board => {
      if (board.columns) {
        board.columns.forEach(column => {
          if (column.cards) {
            totalTasks += column.cards.length;
            
            // Contabilizar prioridades
            column.cards.forEach(card => {
              const priority = card.priority?.toLowerCase() || 'media';
              if (priorityCounts.hasOwnProperty(priority)) {
                priorityCounts[priority]++;
              } else {
                priorityCounts.media++; // Default para prioridade média
              }
            });
            
            if (column.name.toLowerCase().includes('concluído') || 
                column.name.toLowerCase().includes('concluido') ||
                column.name.toLowerCase().includes('done') ||
                column.name.toLowerCase().includes('finalizado')) {
              completedTasks += column.cards.length;
            }
          }
        });
      }
    });

    // Calcular percentuais das prioridades
    const priorityStatsData = {};
    Object.keys(priorityCounts).forEach(priority => {
      priorityStatsData[priority] = {
        count: priorityCounts[priority],
        percentage: totalTasks > 0 ? Math.round((priorityCounts[priority] / totalTasks) * 100) : 0
      };
    });

    setStats({
      totalBoards: boardsData.length,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks
    });

    setPriorityStats(priorityStatsData);
    calculateFilteredStats(boardsData);
  };

  // Nova função para calcular estatísticas filtradas
  const calculateFilteredStats = (boardsData) => {
    let filteredBoards = boardsData;
    
    // Filtrar por quadro
    if (selectedBoardId !== 'all') {
      filteredBoards = boardsData.filter(board => board.id.toString() === selectedBoardId);
    }
    
    let totalFilteredTasks = 0;
    let filteredPriorityCounts = { alta: 0, media: 0, baixa: 0 };
    
    filteredBoards.forEach(board => {
      if (board.columns) {
        board.columns.forEach(column => {
          if (column.cards) {
            column.cards.forEach(card => {
              const priority = card.priority?.toLowerCase() || 'media';
              
              // Aplicar filtros
              const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;
              const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'completed' && 
                 (column.name.toLowerCase().includes('concluído') || 
                  column.name.toLowerCase().includes('concluido') ||
                  column.name.toLowerCase().includes('done') ||
                  column.name.toLowerCase().includes('finalizado'))) ||
                (statusFilter === 'pending' && 
                 !(column.name.toLowerCase().includes('concluído') || 
                   column.name.toLowerCase().includes('concluido') ||
                   column.name.toLowerCase().includes('done') ||
                   column.name.toLowerCase().includes('finalizado')));
              
              if (matchesPriority && matchesStatus) {
                totalFilteredTasks++;
                if (filteredPriorityCounts.hasOwnProperty(priority)) {
                  filteredPriorityCounts[priority]++;
                } else {
                  filteredPriorityCounts.media++;
                }
              }
            });
          }
        });
      }
    });
    
    // Calcular percentuais das prioridades filtradas
    const filteredPriorityStatsData = {};
    Object.keys(filteredPriorityCounts).forEach(priority => {
      filteredPriorityStatsData[priority] = {
        count: filteredPriorityCounts[priority],
        percentage: totalFilteredTasks > 0 ? Math.round((filteredPriorityCounts[priority] / totalFilteredTasks) * 100) : 0
      };
    });
    
    setPriorityStats(filteredPriorityStatsData);
  };

  // Recalcular quando os filtros mudarem
  useEffect(() => {
    if (boards.length > 0) {
      calculateFilteredStats(boards);
    }
  }, [selectedBoardId, priorityFilter, statusFilter, boards]);

  const goToBoard = (board) => {
    const slug = nameToSlug(board.name);
    navigate(`/kanban/${slug}`);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    
    if (!newBoardName.trim()) {
      alert('Por favor, digite um nome para o quadro.');
      return;
    }

    try {
      const newBoard = await apiService.createBoard(newBoardName.trim());
      setBoards(prev => [...prev, newBoard]);
      setNewBoardName('');
      setIsCreatingBoard(false);
      
      const slug = nameToSlug(newBoard.name);
      navigate(`/kanban/${slug}`);
    } catch (err) {
      console.error('Erro ao criar quadro:', err);
      alert('Erro ao criar quadro. Tente novamente.');
    }
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

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.user-dropdown-container');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="kanban-container">
        <div className="loading-state">
          <div className="loading-content">
            <div className="loading-spinner"><Icon emoji="⏳" size={32} /></div>
            <h2>Carregando dashboard...</h2>
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
                onClick={() => navigate('/')}
              >
                <Icon emoji="🏠" size={16} /> Voltar ao Início
              </button>
              <button 
                className="btn-primary"
                onClick={loadDashboardData}
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1><Icon emoji="📊" /> Dashboard</h1>
            <p>Visão geral dos seus quadros e tarefas</p>
          </div>
          <div className="user-dropdown-container">
            <button className={`user-profile-btn ${user?.photo ? 'has-photo' : ''}`} onClick={toggleUserDropdown}>
              {user?.photo ? (
                <img 
                  src={user.photo} 
                  alt="Foto do perfil" 
                  style={{ 
                    width: '52px', 
                    height: '52px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
              ) : (
                <div style={{ fontSize: '32px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon emoji="👤" size={32} color="white" />
                </div>
              )}
            </button>
            
            {isUserDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-item" onClick={handleMyAccount}>
                  <span className="item-icon"><Icon emoji="⚙️" /></span>
                  <span>Minha Conta</span>
                </div>
                <div className="dropdown-separator"></div>
                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  <span className="item-icon"><Icon emoji="🚪" /></span>
                  <span>Sair</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        
        <section className="stats-section">
          <h2><Icon emoji="📈" /> Estatísticas</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><Icon emoji="📋" size={24} /></div>
              <div className="stat-info">
                <div className="stat-number">{stats.totalBoards}</div>
                <div className="stat-label">Quadros</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icon emoji="📝" size={24} /></div>
              <div className="stat-info">
                <div className="stat-number">{stats.totalTasks}</div>
                <div className="stat-label">Total de Tarefas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icon emoji="✅" size={24} /></div>
              <div className="stat-info">
                <div className="stat-number">{stats.completedTasks}</div>
                <div className="stat-label">Concluídas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icon emoji="⏳" size={24} /></div>
              <div className="stat-info">
                <div className="stat-number">{stats.pendingTasks}</div>
                <div className="stat-label">Pendentes</div>
              </div>
            </div>
          </div>
        </section>

        {stats.totalTasks > 0 && (
          <section className="priority-section">
            <div className="priority-header">
              <h2><Icon emoji="🎯" /> Prioridades das Tarefas</h2>
              
              <div className="priority-filters">
                <div className="filter-group">
                  <label><Icon emoji="📋" /> Quadro:</label>
                  <select 
                    value={selectedBoardId} 
                    onChange={(e) => setSelectedBoardId(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todos os Quadros</option>
                    {boards.map(board => (
                      <option key={board.id} value={board.id.toString()}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label><Icon emoji="⭐" /> Prioridade:</label>
                  <select 
                    value={priorityFilter} 
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todas</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label><Icon emoji="📊" /> Status:</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendentes</option>
                    <option value="completed">Concluídas</option>
                  </select>
                </div>
                
                <button 
                  className="filter-reset-btn"
                  onClick={() => {
                    setSelectedBoardId('all');
                    setPriorityFilter('all');
                    setStatusFilter('all');
                  }}
                  title="Limpar filtros"
                >
                  <Icon emoji="🔄" /> Limpar
                </button>
              </div>
            </div>
            
            <div className="priority-content">
              <div className="priority-stats-grid">
                <div className="priority-stat-card alta">
                  <div className="priority-stat-icon"><Icon emoji="🔴" size={24} /></div>
                  <div className="priority-stat-info">
                    <div className="priority-stat-number">{priorityStats.alta.count}</div>
                    <div className="priority-stat-percentage">{priorityStats.alta.percentage}%</div>
                    <div className="priority-stat-label">Alta Prioridade</div>
                  </div>
                </div>
                
                <div className="priority-stat-card media">
                  <div className="priority-stat-icon"><Icon emoji="🟡" size={24} /></div>
                  <div className="priority-stat-info">
                    <div className="priority-stat-number">{priorityStats.media.count}</div>
                    <div className="priority-stat-percentage">{priorityStats.media.percentage}%</div>
                    <div className="priority-stat-label">Média Prioridade</div>
                  </div>
                </div>
                
                <div className="priority-stat-card baixa">
                  <div className="priority-stat-icon"><Icon emoji="🟢" size={24} /></div>
                  <div className="priority-stat-info">
                    <div className="priority-stat-number">{priorityStats.baixa.count}</div>
                    <div className="priority-stat-percentage">{priorityStats.baixa.percentage}%</div>
                    <div className="priority-stat-label">Baixa Prioridade</div>
                  </div>
                </div>
              </div>

              <div className="priority-charts-container">
                <div className="chart-container">
                  <h3>Distribuição por Prioridade</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Alta', value: priorityStats.alta.count, color: '#ef4444' },
                            { name: 'Média', value: priorityStats.media.count, color: '#f59e0b' },
                            { name: 'Baixa', value: priorityStats.baixa.count, color: '#10b981' }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {[
                            { name: 'Alta', value: priorityStats.alta.count, color: '#ef4444' },
                            { name: 'Média', value: priorityStats.media.count, color: '#f59e0b' },
                            { name: 'Baixa', value: priorityStats.baixa.count, color: '#10b981' }
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value} tarefa${value !== 1 ? 's' : ''}`,
                            `${name} Prioridade`
                          ]}
                          labelStyle={{ color: '#333' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #ccc',
                            borderRadius: '8px' 
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value) => `${value} Prioridade`}
                          wrapperStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-container">
                  <h3>Comparativo de Tarefas</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={[
                          { name: 'Alta', value: priorityStats.alta.count, fill: '#ef4444' },
                          { name: 'Média', value: priorityStats.media.count, fill: '#f59e0b' },
                          { name: 'Baixa', value: priorityStats.baixa.count, fill: '#10b981' }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#fff', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                          tickLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                        />
                        <YAxis 
                          tick={{ fill: '#fff', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                          tickLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value} tarefa${value !== 1 ? 's' : ''}`,
                            `${name} Prioridade`
                          ]}
                          labelFormatter={(label) => `${label} Prioridade`}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            color: '#333'
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="boards-section">
          <div className="section-header">
            <h2><Icon emoji="📋" /> Meus Quadros</h2>
            <button 
              className="btn-create-board"
              onClick={() => setIsCreatingBoard(true)}
            >
              <span><Icon emoji="➕" /></span> Novo Quadro
            </button>
          </div>

          {isCreatingBoard && (
            <div className="create-board-form">
              <form onSubmit={handleCreateBoard}>
                <input
                  type="text"
                  placeholder="Nome do novo quadro..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  autoFocus
                />
                <div className="form-actions">
                  <button type="submit" className="btn-confirm">Criar</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => {
                      setIsCreatingBoard(false);
                      setNewBoardName('');
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {boards.length === 0 ? (
            <div className="empty-boards">
              <div className="empty-icon"><Icon emoji="📋" size={48} /></div>
              <h3>Nenhum quadro criado</h3>
              <p>Crie seu primeiro quadro para começar a organizar suas tarefas!</p>
              <button 
                className="btn-primary"
                onClick={() => setIsCreatingBoard(true)}
              >
                <Icon emoji="➕" /> Criar Primeiro Quadro
              </button>
            </div>
          ) : (
            <div className="boards-grid">
              {boards.map(board => (
                <div key={board.id} className="board-card" onClick={() => goToBoard(board)}>
                  <div className="board-header">
                    <h3>{board.name}</h3>
                    <div className="board-stats">
                      {board.columns && (
                        <span className="column-count">
                          {board.columns.length} coluna{board.columns.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {board.columns && board.columns.length > 0 && (
                    <div className="board-preview">
                      {board.columns.slice(0, 3).map(column => (
                        <div key={column.id} className="column-preview">
                          <div className="column-name">{column.name}</div>
                          <div className="cards-count">
                            {column.cards ? column.cards.length : 0} tarefa{(column.cards ? column.cards.length : 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                      {board.columns.length > 3 && (
                        <div className="more-columns">
                          +{board.columns.length - 3} mais
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="board-footer">
                    <span className="board-action"><Icon emoji="🔗" /> Abrir quadro</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
} 