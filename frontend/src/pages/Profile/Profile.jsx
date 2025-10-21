import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../utils/iconMapping.jsx';
import apiService from '../../services/api';
import Modal from '../../components/Modal.jsx';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para edição
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  
  // Estados para exclusão de conta
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteInputModal, setShowDeleteInputModal] = useState(false);
  const [deleteConfirmationMessage, setDeleteConfirmationMessage] = useState('');
  const [deleteInputValue, setDeleteInputValue] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Preview da foto
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    // Limpar dados corrompidos primeiro
    apiService.clearCorruptedData();
    
    // Verificar se o usuário está autenticado
    if (!apiService.isAuthenticated()) {
      navigate('/auth');
      return;
    }
    
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Limpar dados corrompidos
      const currentUser = localStorage.getItem('user');
      if (currentUser === 'undefined' || currentUser === 'null' || !currentUser) {
        localStorage.removeItem('user');
      }
      
      // Primeiro, tenta obter dados do localStorage
      let localUser = apiService.getUser();
      
      // Se não há dados locais, tentar extrair do token
      if (!localUser) {
        // Tentar extrair dados do token JWT
        const tokenUser = apiService.extractUserFromToken();
        
        if (tokenUser && tokenUser.email) {
          localUser = {
            id: tokenUser.id || 'temp-user',
            name: tokenUser.name || 'Usuário',
            email: tokenUser.email,
            photo: tokenUser.photo || null
          };
          // Salvar dados extraídos do token no localStorage
          localStorage.setItem('user', JSON.stringify(localUser));
        } else {
          // Se não conseguir extrair do token, redirecionar para login
          navigate('/auth');
          return;
        }
      }
      
      // Verificar se temos dados válidos
      if (!localUser || !localUser.name || !localUser.email) {
        navigate('/auth');
        return;
      }

      if (localUser) {
        setUser(localUser);
        setFormData(prev => ({
          ...prev,
          name: localUser.name || ''
        }));
      }
      
      // Depois, tenta atualizar com dados do servidor
      try {
        const userData = await apiService.getCurrentUser();
        // Preservar foto local se o servidor não retornar uma foto
        const mergedUserData = {
          ...userData,
          photo: userData.photo || localUser.photo || null
        };
        setUser(mergedUserData);
        setFormData(prev => ({
          ...prev,
          name: mergedUserData.name || ''
        }));
      } catch (serverErr) {
        console.warn('Não foi possível obter dados atualizados do servidor:', serverErr);
        // Se não conseguir do servidor mas tem dados locais, continua
        if (!localUser) {
          throw new Error('Não foi possível carregar dados do usuário. Faça login novamente.');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      setError(err.message || 'Erro ao carregar dados do perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Upload da foto
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file) => {
    try {
      setIsUploadingPhoto(true);
      setError(null);
      
      // Usar o método do apiService
      const result = await apiService.uploadPhoto(file);
      
      // Atualizar o estado do usuário com a nova foto
      setUser(prev => ({ ...prev, photo: result.photoUrl }));
      
      // Limpar o preview temporário
      setPhotoPreview(null);
      
      setSuccess('Foto atualizada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Erro ao fazer upload da foto:', err);
      setError('Erro ao atualizar foto. Tente novamente.');
      setPhotoPreview(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsRemovingPhoto(true);
      setError(null);
      
      // Usar o método do apiService
      await apiService.removePhoto();
      
      // Atualizar o estado do usuário removendo a foto
      setUser(prev => ({ ...prev, photo: null }));
      
      // Limpar o preview temporário se existir
      setPhotoPreview(null);
      
      setSuccess('Foto removida com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Erro ao remover foto:', err);
      setError('Erro ao remover foto. Tente novamente.');
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  // Funções para exclusão de conta
  const handleDeleteAccountClick = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirmNo = () => {
    setShowDeleteConfirmModal(false);
  };

  const handleDeleteConfirmYes = async () => {
    try {
      setShowDeleteConfirmModal(false);
      setError(null);
      
      // Gerar mensagem de confirmação
      const response = await apiService.generateDeleteConfirmation();
      
      setDeleteConfirmationMessage(response.confirmationMessage);
      setDeleteInputValue('');
      setShowDeleteInputModal(true);
      
    } catch (err) {
      console.error('Erro ao gerar mensagem de confirmação:', err);
      setError('Erro ao gerar mensagem de confirmação. Tente novamente.');
    }
  };

  const handleDeleteInputCancel = () => {
    setShowDeleteInputModal(false);
    setDeleteConfirmationMessage('');
    setDeleteInputValue('');
  };

  const handleDeleteInputConfirm = async () => {
    try {
      setIsDeletingAccount(true);
      setError(null);
      
      // Verificar se a mensagem está correta
      if (deleteInputValue.trim() !== deleteConfirmationMessage) {
        setError('Mensagem de confirmação incorreta. Digite exatamente como mostrado.');
        return;
      }
      
      // Excluir conta
      await apiService.deleteAccount(deleteInputValue.trim());
      
      // Redirecionar para página inicial
      navigate('/auth');
      
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      setError(err.message || 'Erro ao excluir conta. Tente novamente.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Por favor, digite um nome válido.');
      return;
    }

    try {
      setError(null);
      
      // Usar o método do apiService
      const result = await apiService.updateProfile(formData.name.trim());
      setUser(prev => ({ ...prev, name: result.name || formData.name.trim() }));
      setIsEditingName(false);
      setSuccess('Nome atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Erro ao atualizar nome:', err);
      setError('Erro ao atualizar nome. Tente novamente.');
    }
  };

  // Função para validar a força da senha
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('pelo menos 8 caracteres');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('pelo menos 1 letra minúscula');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('pelo menos 1 letra maiúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('pelo menos 1 número');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('pelo menos 1 caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }
    
    return errors;
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos de senha.');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }
    
    // Validação robusta da nova senha
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setError(`A nova senha deve conter: ${passwordErrors.join(', ')}.`);
      return;
    }
    
    // Verificar se a nova senha é diferente da atual
    if (formData.currentPassword === formData.newPassword) {
      setError('A nova senha deve ser diferente da senha atual.');
      return;
    }

    try {
      setError(null);
      
      // Usar o método do apiService
      await apiService.updatePassword(formData.currentPassword, formData.newPassword);
      
      setIsEditingPassword(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSuccess('Senha atualizada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      setError(err.message || 'Erro ao atualizar senha. Tente novamente.');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-content">
            <div className="loading-spinner"><Icon emoji="⏳" size={32} /></div>
            <h2>Carregando perfil...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <div className="error-content">
            <div className="error-icon"><Icon emoji="❌" size={32} /></div>
            <h2>Erro ao carregar perfil</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                className="btn-secondary"
                onClick={handleBack}
              >
                <Icon emoji="📊" size={16} /> Voltar ao Dashboard
              </button>
              <button 
                className="btn-primary"
                onClick={loadUserData}
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
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={handleBack}>
          <Icon emoji="←" size={20} />
          <span>Voltar</span>
        </button>
        <h1><Icon emoji="👤" /> Meu Perfil</h1>
      </div>

      <div className="profile-content">
        {/* Mensagens de feedback */}
        {error && (
          <div className="alert alert-error">
            <Icon emoji="❌" size={16} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <Icon emoji="✕" size={14} />
            </button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <Icon emoji="✅" size={16} />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)}>
              <Icon emoji="✕" size={14} />
            </button>
          </div>
        )}

        {/* Seção da foto */}
        <div className="profile-section">
          <h2><Icon emoji="📸" /> Foto do Perfil</h2>
          <div className="photo-section">
            <div className="photo-container" onClick={handlePhotoClick}>
              {isUploadingPhoto || isRemovingPhoto ? (
                <div className="photo-loading">
                  <Icon emoji="⏳" size={32} />
                </div>
              ) : (
                <>
                  {photoPreview || user?.photo ? (
                    <img 
                      src={photoPreview || user.photo} 
                      alt="Foto do perfil" 
                      className="profile-photo"
                    />
                  ) : (
                    <div className="photo-placeholder">
                      <Icon emoji="👤" size={48} />
                    </div>
                  )}
                  <div className="photo-overlay">
                    <Icon emoji="📷" size={24} />
                    <span>Alterar Foto</span>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <div className="photo-actions">
              <p className="photo-hint">
                Clique na foto para alterar. Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
              </p>
              {(user?.photo || photoPreview) && (
                <button 
                  className="btn-remove-photo"
                  onClick={handleRemovePhoto}
                  disabled={isUploadingPhoto || isRemovingPhoto}
                >
                  <Icon emoji="🗑️" size={16} />
                  {isRemovingPhoto ? 'Removendo...' : 'Remover Foto'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Seção do nome */}
        <div className="profile-section">
          <h2><Icon emoji="✏️" /> Nome</h2>
          {isEditingName ? (
            <form onSubmit={handleUpdateName} className="edit-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome"
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setIsEditingName(false);
                  setFormData(prev => ({ ...prev, name: user?.name || '' }));
                }}>
                  <Icon emoji="✕" size={16} /> Cancelar
                </button>
                <button type="submit" className="btn-save">
                  <Icon emoji="✅" size={16} /> Salvar
                </button>
              </div>
            </form>
          ) : (
            <div className="info-display">
              <div className="info-value">
                <span>{user?.name || 'Nome não informado'}</span>
              </div>
              <button 
                className="btn-edit"
                onClick={() => setIsEditingName(true)}
              >
                <Icon emoji="✏️" size={16} /> Editar
              </button>
            </div>
          )}
        </div>

        {/* Seção do email */}
        <div className="profile-section">
          <h2><Icon emoji="📧" /> Email</h2>
          <div className="info-display">
            <div className="info-value">
              <span className={user?.email === 'Email não disponível' ? 'email-unavailable' : ''}>
                {user?.email || 'Email não informado'}
              </span>
            </div>
            <div className="info-note">
              <Icon emoji="🔒" size={14} />
              <span>O email não pode ser alterado</span>
            </div>
          </div>
        </div>

        {/* Seção da senha */}
        <div className="profile-section">
          <h2><Icon emoji="🔐" /> Senha</h2>
          {isEditingPassword ? (
            <form onSubmit={handleUpdatePassword} className="edit-form">
              <div className="form-group">
                <label>Senha Atual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha atual"
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Nova Senha</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Digite a nova senha"
                  className="form-input"
                />
                {formData.newPassword && (
                  <div className="password-requirements">
                    <div className="requirements-title">
                      <Icon emoji="🔐" size={14} />
                      <span>Requisitos da senha:</span>
                    </div>
                    <div className="requirements-list">
                      <div className={`requirement ${formData.newPassword.length >= 8 ? 'valid' : 'invalid'}`}>
                        <Icon emoji={formData.newPassword.length >= 8 ? "✅" : "❌"} size={12} />
                        <span>Pelo menos 8 caracteres</span>
                      </div>
                      <div className={`requirement ${/[a-z]/.test(formData.newPassword) ? 'valid' : 'invalid'}`}>
                        <Icon emoji={/[a-z]/.test(formData.newPassword) ? "✅" : "❌"} size={12} />
                        <span>Pelo menos 1 letra minúscula</span>
                      </div>
                      <div className={`requirement ${/[A-Z]/.test(formData.newPassword) ? 'valid' : 'invalid'}`}>
                        <Icon emoji={/[A-Z]/.test(formData.newPassword) ? "✅" : "❌"} size={12} />
                        <span>Pelo menos 1 letra maiúscula</span>
                      </div>
                      <div className={`requirement ${/\d/.test(formData.newPassword) ? 'valid' : 'invalid'}`}>
                        <Icon emoji={/\d/.test(formData.newPassword) ? "✅" : "❌"} size={12} />
                        <span>Pelo menos 1 número</span>
                      </div>
                      <div className={`requirement ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(formData.newPassword) ? 'valid' : 'invalid'}`}>
                        <Icon emoji={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(formData.newPassword) ? "✅" : "❌"} size={12} />
                        <span>Pelo menos 1 caractere especial</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirme a nova senha"
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setIsEditingPassword(false);
                  setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  }));
                }}>
                  <Icon emoji="✕" size={16} /> Cancelar
                </button>
                <button type="submit" className="btn-save">
                  <Icon emoji="✅" size={16} /> Alterar Senha
                </button>
              </div>
            </form>
          ) : (
            <div className="info-display">
              <div className="info-value">
                <span>••••••••</span>
              </div>
              <button 
                className="btn-edit"
                onClick={() => setIsEditingPassword(true)}
              >
                <Icon emoji="🔐" size={16} /> Alterar Senha
              </button>
            </div>
          )}
        </div>

        {/* Seção de exclusão de conta */}
        <div className="profile-section danger-section">
          <h2><Icon emoji="⚠️" /> Zona de Perigo</h2>
          <div className="danger-content">
            <div className="danger-info">
              <h3>Excluir Conta</h3>
              <p>
                Esta ação é <strong>irreversível</strong>. Todos os seus dados, incluindo perfil, 
                boards, colunas e cards serão permanentemente excluídos e não poderão ser recuperados.
              </p>
            </div>
            <button 
              className="btn-delete-account"
              onClick={handleDeleteAccountClick}
              disabled={isDeletingAccount}
            >
              <Icon emoji="🗑️" size={16} />
              {isDeletingAccount ? 'Excluindo...' : 'Excluir Conta'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmação inicial */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={handleDeleteConfirmNo}
        title={<><Icon emoji="⚠️" size={24} /> Confirmar Exclusão</>}
        showCloseButton={false}
      >
        <p>
          Tem certeza de que deseja excluir sua conta? Esta ação é <strong>irreversível </strong> 
          e todos os seus dados serão permanentemente perdidos.
        </p>
        <div className="warning-text">
          <strong>ATENÇÃO:</strong> Todos os seus boards, colunas, cards e dados pessoais 
          serão excluídos permanentemente e não poderão ser recuperados.
        </div>
        <div className="modal-actions">
          <button 
            className="modal-btn modal-btn-secondary"
            onClick={handleDeleteConfirmNo}
          >
            <Icon emoji="✕" size={16} /> Não, Cancelar
          </button>
          <button 
            className="modal-btn modal-btn-danger"
            onClick={handleDeleteConfirmYes}
          >
            <Icon emoji="⚠️" size={16} /> Sim, Continuar
          </button>
        </div>
      </Modal>

      {/* Modal de confirmação com input */}
      <Modal
        isOpen={showDeleteInputModal}
        onClose={handleDeleteInputCancel}
        title={<><Icon emoji="🔒" size={24} /> Confirmação Final</>}
        showCloseButton={false}
      >
        <p>
          Para deletar a sua conta, escreva a seguinte mensagem no campo abaixo:
        </p>
        <div className="delete-confirmation-message">
          {deleteConfirmationMessage}
        </div>
        <input
          type="text"
          className="modal-input"
          value={deleteInputValue}
          onChange={(e) => setDeleteInputValue(e.target.value)}
          placeholder="Digite a mensagem exatamente como mostrado acima"
          disabled={isDeletingAccount}
        />
        <div className="modal-actions">
          <button 
            className="modal-btn modal-btn-secondary"
            onClick={handleDeleteInputCancel}
            disabled={isDeletingAccount}
          >
            <Icon emoji="✕" size={16} /> Cancelar
          </button>
          <button 
            className="modal-btn modal-btn-danger"
            onClick={handleDeleteInputConfirm}
            disabled={isDeletingAccount || deleteInputValue.trim() !== deleteConfirmationMessage}
          >
            <Icon emoji="🗑️" size={16} />
            {isDeletingAccount ? 'Excluindo...' : 'Excluir Conta'}
          </button>
        </div>
      </Modal>
    </div>
  );
} 