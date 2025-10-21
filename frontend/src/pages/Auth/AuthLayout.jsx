import React from 'react';
import Icon from '../../utils/iconMapping.jsx';
import Logo from '../../assets/logobranca.png';

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  isSignUp, 
  onBackToLanding 
}) {
  return (
    <div className="login-page">
      <div className="login-background">
        <div className="background-shape shape-1"></div>
        <div className="background-shape shape-2"></div>
        <div className="background-shape shape-3"></div>
      </div>

      <header className="login-header">
        <div className="login-logo" onClick={onBackToLanding}>
          <img src={Logo} className='logoauth' alt="" />
        </div>
        <button className="back-btn" onClick={onBackToLanding}>
          ← Voltar
        </button>
      </header>

      <div className="login-container">
        <div className="login-card">
          <div className="login-info">
            <div className="info-content">
              <h2>{title}</h2>
              <p>{subtitle}</p>
              
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon"><Icon emoji="⚡" /></span>
                  <span>Organize tarefas rapidamente</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon"><Icon emoji="🎯" /></span>
                  <span>Acompanhe o progresso visualmente</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon"><Icon emoji="📊" /></span>
                  <span>Gerencie múltiplos projetos</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon"><Icon emoji="🔄" /></span>
                  <span>Sincronize em todos os dispositivos</span>
                </div>
              </div>


            </div>
          </div>

          <div className="login-form-section">
            {children}
          </div>
        </div>
      </div>

      <footer className="login-footer">
        <p>&copy; 2025 ServiTask. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
} 