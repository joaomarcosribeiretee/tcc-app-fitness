import { AuthRepository } from "../entities/AuthRepository";

/**
 * Repositório HTTP para autenticação
 * Faz chamadas reais ao backend Python
 */
export class HttpAuthRepository implements AuthRepository {
  private baseURL = 'http://localhost:8000'; // URL do seu backend Python

  async login(email: string, senha: string): Promise<{ token: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      return { token: data.token };
    } catch (error) {
      throw new Error('Erro ao fazer login');
    }
  }

  async register(
    nome: string,
    username: string,
    email: string,
    senha: string
  ): Promise<{ token: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, username, email, senha }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao cadastrar');
      }

      const data = await response.json();
      return { token: data.token };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao cadastrar');
    }
  }

  async me(token: string): Promise<{ id: string; nome: string; username: string; email: string }> {
    try {
      console.log('🔑 Decodificando token:', token);
      
      // Decodificar o JWT para pegar os dados do usuário
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('📦 Payload decodificado:', payload);
      
      const userData = payload.sub;
      console.log('👤 Dados do usuário:', userData);
      
      if (!userData || !userData.id) {
        throw new Error('Token inválido - dados do usuário não encontrados');
      }
      
      return {
        id: String(userData.id), // Garantir que é string
        nome: userData.nome,
        username: userData.username,
        email: userData.email
      };
    } catch (error) {
      console.error('❌ Erro ao decodificar token:', error);
      throw new Error(`Não autenticado: ${error instanceof Error ? error.message : 'Token inválido'}`);
    }
  }
}

