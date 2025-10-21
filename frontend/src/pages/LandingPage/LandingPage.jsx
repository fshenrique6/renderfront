import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../utils/iconMapping.jsx';
import './LandingPage.css';
import Logo from '../../assets/logodegrade.png';

export default function LandingPage() {
  const navigate = useNavigate();

  const [mockupCards, setMockupCards] = useState({
    'a-fazer': [
      { id: 1, title: 'Design da Interface', priority: 'alta' },
      { id: 2, title: 'Documentação', priority: 'media' }
    ],
    'em-progresso': [
      { id: 3, title: 'Desenvolvimento Frontend', priority: 'alta' },
      { id: 5, title: 'Testes de Usabilidade', priority: 'baixa' }
    ],
    'concluido': [
      { id: 4, title: 'Planejamento', priority: 'media' }
    ]
  });

  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleGetStarted = () => {
    navigate('/auth');
  }

  const handleGoToKanban = () => {
    navigate('/kanban');
  }

  const handleDragStart = (e, card, sourceColumn) => {
    console.log('Drag started:', card.title, 'from', sourceColumn);
    setDraggedCard({ card, sourceColumn });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    console.log('Drop on:', targetColumn, 'with card:', draggedCard?.card?.title);
    setDragOverColumn(null);
    
    if (!draggedCard || draggedCard.sourceColumn === targetColumn) {
      setDraggedCard(null);
      return;
    }

    const newCards = { ...mockupCards };
    
    newCards[draggedCard.sourceColumn] = newCards[draggedCard.sourceColumn].filter(
      card => card.id !== draggedCard.card.id
    );
    
    newCards[targetColumn] = [...newCards[targetColumn], draggedCard.card];
    
    console.log('Cards updated:', newCards);
    setMockupCards(newCards);
    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  return (
    <div className="landing-page">
      
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <img src={Logo} className='imglogo' alt="" />
          </div>
          
          <nav className="nav">
            <a href="#features">Recursos</a>
            <a href="#about">Sobre</a>
            <button className="btn-header" onClick={handleGetStarted}>
              Começar Agora
            </button>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            
            <div className="hero-text">
              <h1>Organize suas tarefas com <span className="highlight">ServiTask</span></h1>
              <p className="hero-description">
                A ferramenta de gerenciamento de projetos que simplifica sua vida. 
                Organize, priorize e acompanhe suas tarefas de forma visual e intuitiva.
              </p>
              
              <div className="hero-buttons">
                <button className="btn-primary-hero" onClick={handleGetStarted}>
                  <Icon emoji="🚀" /> Começar Gratuitamente
                </button>
              </div>
              
              <div className="hero-features">
                <div className="feature-item">
                  <span className="feature-icon"><Icon emoji="⚡" /></span>
                  <span>Rápido e Intuitivo</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon"><Icon emoji="🎯" /></span>
                  <span>Foco na Produtividade</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon"><Icon emoji="📱" /></span>
                  <span>Responsivo</span>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="mockup-kanban">
                <div className="mockup-header">
                  <div className="mockup-title">Projeto Exemplo</div>
                  <div className="mockup-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="drag-instruction">
                  <Icon emoji="🌟" /> Arraste os cards entre as colunas para testar!
                </div>
                
                <div className="mockup-columns">
                  <div 
                    className={`mockup-column ${dragOverColumn === 'a-fazer' ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 'a-fazer')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'a-fazer')}
                  >
                    <div className="column-title">A Fazer</div>
                    {mockupCards['a-fazer'].map(card => (
                      <div 
                        key={card.id}
                        className={`mockup-card ${card.priority} ${draggedCard?.card.id === card.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card, 'a-fazer')}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="card-title">{card.title}</div>
                        <div className={`priority-badge ${card.priority}`}>
                          {card.priority === 'alta' ? 'Alta' : card.priority === 'media' ? 'Média' : 'Baixa'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div 
                    className={`mockup-column ${dragOverColumn === 'em-progresso' ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 'em-progresso')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'em-progresso')}
                  >
                    <div className="column-title">Em Progresso</div>
                    {mockupCards['em-progresso'].map(card => (
                      <div 
                        key={card.id}
                        className={`mockup-card ${card.priority} ${draggedCard?.card.id === card.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card, 'em-progresso')}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="card-title">{card.title}</div>
                        <div className={`priority-badge ${card.priority}`}>
                          {card.priority === 'alta' ? 'Alta' : card.priority === 'media' ? 'Média' : 'Baixa'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div 
                    className={`mockup-column ${dragOverColumn === 'concluido' ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 'concluido')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'concluido')}
                  >
                    <div className="column-title">Concluído</div>
                    {mockupCards['concluido'].map(card => (
                      <div 
                        key={card.id}
                        className={`mockup-card done ${card.priority} ${draggedCard?.card.id === card.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card, 'concluido')}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="card-title">{card.title}</div>
                        <div className={`priority-badge ${card.priority}`}>
                          {card.priority === 'alta' ? 'Alta' : card.priority === 'media' ? 'Média' : 'Baixa'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container constrained">
          
          <div className="section-header">
            <h2>Recursos Poderosos</h2>
            <p>Tudo que você precisa para gerenciar seus projetos de forma eficiente</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-large"><Icon emoji="🎨" size={48} /></div>
              <h3>Interface Intuitiva</h3>
              <p>Design limpo e moderno que facilita o uso diário. Visualize suas tarefas de forma clara e organizada.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large"><Icon emoji="🔥" size={48} /></div>
              <h3>Priorização Inteligente</h3>
              <p>Sistema de prioridades com cores para identificar rapidamente as tarefas mais importantes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large"><Icon emoji="📊" size={48} /></div>
              <h3>Quadros Kanban</h3>
              <p>Metodologia visual para acompanhar o progresso das tarefas em tempo real.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large"><Icon emoji="⚡" size={48} /></div>
              <h3>Drag & Drop</h3>
              <p>Mova cartões entre colunas de forma simples e rápida, apenas arrastando e soltando.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large"><Icon emoji="🎯" size={48} /></div>
              <h3>Múltiplos Projetos</h3>
              <p>Gerencie vários projetos simultaneamente com quadros independentes para cada um.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large"><Icon emoji="📱" size={48} /></div>
              <h3>Totalmente Responsivo</h3>
              <p>Acesse de qualquer dispositivo - desktop, tablet ou smartphone com a mesma experiência.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container constrained">
          <div className="about-content">
            
            <div className="about-text">
              <h2>Por que escolher o ServiTask?</h2>
              <p>
                O ServiTask foi desenvolvido pensando na simplicidade e eficiência. 
                Sabemos que gerenciar projetos pode ser complexo, por isso criamos 
                uma ferramenta que torna esse processo mais visual e intuitivo.
              </p>
              
              <div className="about-stats">
                <div className="stat">
                  <div className="stat-number"><Icon emoji="🚀" size={32} /></div>
                  <div className="stat-label">Produtividade Aumentada</div>
                </div>
                <div className="stat">
                  <div className="stat-number"><Icon emoji="⏰" size={32} /></div>
                  <div className="stat-label">Economia de Tempo</div>
                </div>
                <div className="stat">
                  <div className="stat-number"><Icon emoji="🌟" size={32} /></div>
                  <div className="stat-label">Interface Moderna</div>
                </div>
              </div>
            </div>
            
            <div className="about-image">
              <div className="productivity-visual">
                <div className="productivity-circle">
                  <div className="productivity-text">
                    <span className="productivity-number">100%</span>
                    <span className="productivity-label">Organizado</span>
                  </div>
                </div>
                <div className="productivity-items">
                  <div className="productivity-item"><Icon emoji="📝" /> Tarefas Claras</div>
                  <div className="productivity-item"><Icon emoji="🎯" /> Objetivos Definidos</div>
                  <div className="productivity-item"><Icon emoji="📈" /> Progresso Visível</div>
                  <div className="productivity-item"><Icon emoji="✅" /> Resultados Alcançados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container constrained">
          <div className="cta-content">
            <h2>Pronto para aumentar sua produtividade?</h2>
            <p>Comece a usar o ServiTask agora mesmo e transforme a forma como você gerencia seus projetos.</p>
            <button className="btn-cta" onClick={handleGetStarted}>
              <Icon emoji="🚀" /> Começar Agora - É Grátis!
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container constrained">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon"><Icon emoji="📋" /></span>
              <span className="logo-text">ServiTask</span>
            </div>
            <p className="footer-text">
              Simplificando o gerenciamento de projetos, uma tarefa por vez.
            </p>
            <button className="temp-kanban-btn" onClick={handleGoToKanban}>
              <Icon emoji="🚀" /> Acesso Temporário ao Kanban
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
} 