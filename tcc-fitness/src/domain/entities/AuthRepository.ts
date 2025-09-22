export interface AuthRepository {
    login(email: string, senha: string): Promise<{ token: string }>;
    register(nome: string, email: string, senha: string): Promise<{ token: string }>;
    me(token: string): Promise<{ id: string; nome: string; email: string }>;
  }
  