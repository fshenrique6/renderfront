const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro no login');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        
        // O backend retorna os dados do usuário diretamente no AuthResponse
        const userData = {
          id: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
          photo: data.photo
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(name, email, password, confirmPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          confirmPassword 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro no cadastro');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        
        // O backend retorna os dados do usuário diretamente no AuthResponse
        const userData = {
          id: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
          photo: data.photo
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Dados do usuário salvos no registro:', userData);
      }

      return data;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      try {
        // Tentar obter dados atualizados do servidor
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao obter dados do servidor');
        }

        const userData = await response.json();
        
        // Atualizar dados locais com os dados do servidor
        localStorage.setItem('user', JSON.stringify(userData));
        
        return userData;
      } catch (serverError) {
        // Fallback: usar dados locais se o servidor não estiver disponível
        console.warn('Não foi possível obter dados do servidor, usando dados locais:', serverError);
        
        const localUser = this.getUser();
        if (!localUser) {
          throw new Error('Nenhum dado de usuário disponível');
        }
        
        return localUser;
      }
    } catch (error) {
      throw error;
    }
  }

  async checkEmail(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar email');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw error;
    }
  }

  logout() {
    // Limpar URLs de objeto antes de fazer logout para evitar vazamentos de memória
    const user = this.getUser();
    
    if (user && user.photo && user.photo.startsWith('blob:')) {
      URL.revokeObjectURL(user.photo);
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Método para limpar dados corrompidos
  clearCorruptedData() {
    try {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      
      // Verificar e limpar token corrompido
      if (token === 'undefined' || token === 'null') {
        localStorage.removeItem('authToken');
      }
      
      // Verificar e limpar dados de usuário corrompidos
      if (user === 'undefined' || user === 'null') {
        localStorage.removeItem('user');
      } else if (user) {
        try {
          JSON.parse(user);
        } catch (error) {
          console.warn('Dados de usuário corrompidos, removendo:', error);
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Erro ao limpar dados corrompidos:', error);
    }
  }

  // Método para extrair informações do token JWT
  extractUserFromToken() {
    try {
      const token = this.getAuthToken();
      
      if (!token) return null;

      // Verificar se é um JWT (tem 3 partes separadas por ponto)
      const tokenParts = token.split('.');
      
      if (tokenParts.length !== 3) {
        console.warn('Token não é um JWT válido');
        return null;
      }

      // Decodificar o payload (segunda parte)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      const userData = {
        id: payload.id || payload.sub || payload.userId,
        name: payload.name || payload.username,
        email: payload.email,
        photo: payload.photo || payload.avatar
      };
      
      console.log('Dados extraídos do token:', userData);
      return userData;
    } catch (error) {
      console.warn('Não foi possível extrair dados do token:', error);
      return null;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!(token && token !== 'undefined' && token !== 'null');
  }

  getAuthToken() {
    const token = localStorage.getItem('authToken');
    return (token && token !== 'undefined' && token !== 'null') ? token : null;
  }

  getUser() {
    try {
      const user = localStorage.getItem('user');
      
      // Verificar se o valor existe e não é uma string "undefined" ou "null"
      if (!user || user === 'undefined' || user === 'null') {
        return null;
      }
      
      const parsedUser = JSON.parse(user);
      return parsedUser;
    } catch (error) {
      console.warn('Erro ao fazer parse dos dados do usuário no localStorage:', error);
      // Limpar dados corrompidos
      localStorage.removeItem('user');
      return null;
    }
  }

  // Método utilitário para mesclar dados do usuário
  mergeUserData(newUserData, preservePhoto = true) {
    if (!preservePhoto) {
      return newUserData;
    }

    const existingUser = this.getUser();
    const existingPhoto = existingUser?.photo || null;
    
    return {
      ...newUserData,
      photo: newUserData.photo || existingPhoto
    };
  }

  async getBoards() {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar boards');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter boards:', error);
      throw error;
    }
  }

  async getBoard(boardId) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar board');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter board:', error);
      throw error;
    }
  }

  async createBoard(name) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar board');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar board:', error);
      throw error;
    }
  }

  async updateBoard(boardId, name) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar board');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar board:', error);
      throw error;
    }
  }

  async deleteBoard(boardId) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao deletar board:', error);
      throw error;
    }
  }

  async addColumn(boardId, name) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar coluna');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error);
      throw error;
    }
  }

  async updateColumn(boardId, columnId, name) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns/${columnId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar coluna');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      throw error;
    }
  }

  async removeColumn(boardId, columnId) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns/${columnId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao remover coluna:', error);
      throw error;
    }
  }

  async reorderColumn(boardId, columnId, newPosition) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns/${columnId}/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: newPosition }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao reordenar coluna:', error);
      throw error;
    }
  }

  async addCard(boardId, columnId, title, description = '', priority = 'media') {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      // Validação local
      if (description && description.length > 100) {
        throw new Error('Descrição deve ter no máximo 100 caracteres');
      }

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns/${columnId}/cards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, priority }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        }
        throw new Error('Erro ao adicionar card');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar card:', error);
      throw error;
    }
  }

  async updateCard(boardId, columnId, cardId, title, description = '', priority = 'media') {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      // Validação local
      if (description && description.length > 100) {
        throw new Error('Descrição deve ter no máximo 100 caracteres');
      }

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns/${columnId}/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, priority }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        }
        throw new Error('Erro ao atualizar card');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      throw error;
    }
  }

  async removeCard(boardId, columnId, cardId) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns/${columnId}/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao remover card:', error);
      throw error;
    }
  }

  async moveCard(boardId, cardId, targetColumnId, targetPosition = null) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/boards/${boardId}/cards/${cardId}/move`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetColumnId, targetPosition }),
      });

      if (!response.ok) {
        throw new Error('Erro ao mover card');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao mover card:', error);
      throw error;
    }
  }

  // Métodos para perfil do usuário
  async updateProfile(name) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      try {
        const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao atualizar perfil');
        }

        const result = await response.json();
        
        // Atualizar dados do usuário no localStorage
        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, name: result.name };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return result;
      } catch (fetchError) {
        // Fallback: atualizar apenas localmente se o endpoint não existir
        console.warn('Endpoint não disponível, atualizando localmente:', fetchError);
        
        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, name };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return { name, success: true };
        }
        throw new Error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  async updatePassword(currentPassword, newPassword) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar senha');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  async uploadPhoto(file) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      // Converter arquivo para Base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Enviar como JSON ao invés de FormData
      const response = await fetch(`${API_BASE_URL}/users/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photo: base64,
          filename: file.name,
          contentType: file.type,
          size: file.size
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload da foto');
      }

      const result = await response.json();
      
      // Atualizar dados do usuário no localStorage
      const currentUser = this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, photo: result.photoUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return result;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw error;
    }
  }

  async removePhoto() {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/users/remove-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao remover foto');
      }

      const result = await response.json();
      
      // Atualizar dados do usuário no localStorage
      const currentUser = this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, photo: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return result;
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      throw error;
    }
  }

  async generateDeleteConfirmation() {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/users/generate-delete-confirmation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao gerar mensagem de confirmação');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao gerar mensagem de confirmação:', error);
      throw error;
    }
  }

  async deleteAccount(confirmationMessage) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${API_BASE_URL}/users/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmationMessage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir conta');
      }

      const result = await response.json();
      
      // Limpar todos os dados locais após exclusão bem-sucedida
      this.logout();
      
      return result;
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService; 