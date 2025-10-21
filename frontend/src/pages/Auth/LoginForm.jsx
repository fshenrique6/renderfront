import React, { useState } from 'react';
import Icon from '../../utils/iconMapping.jsx';
import apiService from '../../services/api';

export default function LoginForm({ onLogin, onToggleMode }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação de email
    if (!formData.email.trim()) {
      setError('Por favor, digite seu email.');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Por favor, digite um email válido.');
      return;
    }
    
    // Validação de senha
    if (!formData.password.trim()) {
      setError('Por favor, digite sua senha.');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData.email.trim().toLowerCase(), formData.password);
      console.log('Login bem-sucedido:', response);
      onLogin();
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Tratamento específico de erros baseado na mensagem do backend
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('Credenciais inválidas') || errorMessage.includes('Bad credentials')) {
        setError('🔒 Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
      } else if (errorMessage.includes('Usuário não encontrado') || errorMessage.includes('not found')) {
        setError('👤 Usuário não encontrado. Verifique seu email ou crie uma conta.');
      } else if (errorMessage.includes('Email ou senha incorretos')) {
        setError('🔐 Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
      } else {
        setError('❌ ' + (errorMessage || 'Erro ao fazer login. Tente novamente em alguns instantes.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="form-header">
        <h3>Entrar</h3>
        <p>Entre com suas credenciais</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.9rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">E-mail *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Digite seu e-mail"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Digite sua senha"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? <><Icon emoji="🔄" /> Entrando...</> : <><Icon emoji="🔑" /> Entrar</>}
        </button>

        <div className="forgot-password">
          <a href="#forgot">Esqueceu sua senha?</a>
        </div>

        <div className="toggle-mode">
          <p>
            Não tem uma conta?
            <button type="button" onClick={onToggleMode} className="toggle-btn">
              Criar conta
            </button>
          </p>
        </div>
      </form>
    </>
  );
} 