import { AuthRepository } from "../entities/AuthRepository";
import { API_BASE_URL } from "../../infra/apiConfig";
import { decodeJwtPayload } from "../../utils/jwt";

/**
 * Repositório HTTP para autenticação
 * Faz chamadas reais ao backend Python
 */
export class HttpAuthRepository implements AuthRepository {
  // ⚙️ CONFIGURAÇÃO DO IP DO BACKEND
  // IMPORTANTE: Para funcionar no celular físico, você PRECISA:
  // 1. Estar no mesmo Wi-Fi que o PC
  // 2. Iniciar o backend com: uv run task s
  // 3. O backend deve estar rodando em http://0.0.0.0:8000
  // Para descobrir seu IP: execute get_ip.bat na pasta backend
  private baseURL = API_BASE_URL; // Configurado em infra/apiConfig.ts
  
  // Alternativa para testar na web (navegador):
  // Atualize infra/apiConfig.ts para usar localhost quando necessário

  async login(email: string, senha: string): Promise<{ token: string }> {
    try {
      console.log('🔐 Fazendo login:', email);
      console.log('📡 URL:', `${this.baseURL}/api/login`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      const response = await fetch(`${this.baseURL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('✅ Resposta recebida:', response.status);

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      console.log('🎉 Login bem-sucedido');
      return { token: data.token };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout - Servidor não respondeu');
      }
      throw new Error('Erro ao fazer login: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }

  async register(
    nome: string,
    username: string,
    email: string,
    senha: string
  ): Promise<{ token: string }> {
    try {
      console.log('📝 Cadastrando usuário:', email);
      console.log('📡 URL:', `${this.baseURL}/api/cadastro`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      const response = await fetch(`${this.baseURL}/api/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, username, email, senha }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('✅ Resposta recebida:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao cadastrar');
      }

      const data = await response.json();
      console.log('🎉 Cadastro bem-sucedido');
      return { token: data.token || data.auth_token || "" };
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout - Servidor não respondeu');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao cadastrar');
    }
  }

  async me(token: string): Promise<{ id: string; nome: string; username: string; email: string }> {
    try {
      console.log('🔑 Decodificando token:', token);

      const payload = decodeJwtPayload(token);
      if (!payload) {
        throw new Error('Token inválido');
      }

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

