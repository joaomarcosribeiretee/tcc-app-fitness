export interface AuthRepository {
    login(email: string, senha: string): Promise<{ token: string }>;
    register(nome: string, username: string, email: string, senha: string): Promise<{ token: string }>;
    me(token: string): Promise<{ id: string; nome: string; username: string; email: string }>;
  }
  