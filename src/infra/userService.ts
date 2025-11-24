import * as secure from './secureStore';

export interface UserData {
  id: string;
  nome: string;
  username: string;
  email: string;
}

class UserService {
  private static instance: UserService;
  private currentUser: UserData | null = null;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Salvar dados do usuário após login/registro
  async saveUserData(userData: UserData): Promise<void> {
    try {
      this.currentUser = userData;
      await secure.setItem('current_user', JSON.stringify(userData));
      console.log('✅ Dados do usuário salvos:', userData.username);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }

  // Carregar dados do usuário atual
  async getCurrentUser(): Promise<UserData | null> {
    try {
      // Se já temos em memória, retorna
      if (this.currentUser) {
        return this.currentUser;
      }

      // Tenta carregar do storage
      const userDataString = await secure.getItem('current_user');
      if (userDataString) {
        this.currentUser = JSON.parse(userDataString);
        console.log('✅ Usuário carregado do storage:', this.currentUser?.username);
        return this.currentUser;
      }

      console.log('❌ Nenhum usuário encontrado');
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      return null;
    }
  }

  // Obter ID do usuário atual (para isolamento de dados)
  async getCurrentUserId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.id || null;
  }

  // Limpar dados do usuário (logout)
  async clearUserData(): Promise<void> {
    try {
      this.currentUser = null;
      await secure.deleteItem('current_user');
      console.log('✅ Dados do usuário limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados do usuário:', error);
      throw error;
    }
  }

  // Atualizar dados do usuário
  async updateUserData(updates: Partial<UserData>): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('Usuário não encontrado');
      }

      this.currentUser = { ...this.currentUser, ...updates };
      await secure.setItem('current_user', JSON.stringify(this.currentUser));
      console.log('✅ Dados do usuário atualizados:', this.currentUser.username);
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  }

  // Verificar se usuário está logado
  async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}

export default UserService.getInstance();
