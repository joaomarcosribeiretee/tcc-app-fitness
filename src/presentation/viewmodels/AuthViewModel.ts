import { container } from "../../di/container";
import * as secure from "../../infra/secureStore";

type ValidationErrors = {
  nome?: string;
  username?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  geral?: string;
};

type AuthState = {
  loading: boolean;
  errors: ValidationErrors;
  token?: string;
};

export class AuthViewModel {
  state: AuthState = { loading: false, errors: {} };
  constructor(private emit: (s: AuthState)=>void) {}

  async bootstrap() {
    this.set({ loading: true, errors: {} });
    try {
      const token = await secure.getItem('auth_token');
      if (token) {
        this.set({ loading: false, token });
      } else {
        this.set({ loading: false });
      }
    } catch (e:any) {
      this.set({ loading: false });
    }
  }

  private set(next: Partial<AuthState>) {
    this.state = { 
      ...this.state, 
      ...next,
      errors: next.errors ? next.errors : this.state.errors
    };
    this.emit(this.state);
  }

  clearErrors() {
    this.set({ errors: {} });
  }

  private setError(field: keyof ValidationErrors, message: string) {
    this.set({ 
      errors: { 
        ...this.state.errors, 
        [field]: message 
      } 
    });
  }

  private isValidEmail(email: string): boolean {
    // RFC 5322 pragmatic email regex (strict but practical)
    const re = /^(?:[a-zA-Z0-9_'^&+-])+(?:\.(?:[a-zA-Z0-9_'^&+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  }

  async login(email: string, senha: string): Promise<boolean> {
    this.clearErrors();
    this.set({ loading: true });
    
    let hasErrors = false;

    // Validação de email
    if (!email || email.trim().length === 0) {
      this.setError('email', 'Email é obrigatório');
      hasErrors = true;
    } else if (!this.isValidEmail(email)) {
      this.setError('email', 'Email inválido');
      hasErrors = true;
    }

    // Validação de senha
    if (!senha || senha.length === 0) {
      this.setError('senha', 'Senha é obrigatória');
      hasErrors = true;
    } else if (senha.length < 6) {
      this.setError('senha', 'Senha deve ter ao menos 6 caracteres');
      hasErrors = true;
    }

    if (hasErrors) {
      this.set({ loading: false });
      return false;
    }

    try {
      const { token } = await container.loginUseCase.exec(email, senha);
      await secure.setItem('auth_token', token);
      this.set({ loading: false, token });
      return true;
    } catch (e:any) {
      this.setError('geral', e.message ?? "Erro ao fazer login");
      this.set({ loading: false });
      return false;
    }
  }

  async register(nome: string, username: string, email: string, senha: string, confirmarSenha?: string): Promise<boolean> {
    this.clearErrors();
    this.set({ loading: true });
    
    let hasErrors = false;

    // Validação de nome
    if (!nome || nome.trim().length === 0) {
      this.setError('nome', 'Nome é obrigatório');
      hasErrors = true;
    } else if (nome.trim().length < 2) {
      this.setError('nome', 'Nome deve ter ao menos 2 caracteres');
      hasErrors = true;
    }

    // Validação de username
    if (!username || username.trim().length === 0) {
      this.setError('username', 'Nome de usuário é obrigatório');
      hasErrors = true;
    } else if (username.trim().length < 3) {
      this.setError('username', 'Nome de usuário deve ter ao menos 3 caracteres');
      hasErrors = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.setError('username', 'Use apenas letras, números e underscore');
      hasErrors = true;
    }

    // Validação de email
    if (!email || email.trim().length === 0) {
      this.setError('email', 'Email é obrigatório');
      hasErrors = true;
    } else if (!this.isValidEmail(email)) {
      this.setError('email', 'Email inválido');
      hasErrors = true;
    }

    // Validação de senha
    if (!senha || senha.length === 0) {
      this.setError('senha', 'Senha é obrigatória');
      hasErrors = true;
    } else if (senha.length < 6) {
      this.setError('senha', 'Senha deve ter ao menos 6 caracteres');
      hasErrors = true;
    }

    // Validação de confirmação de senha (se fornecida)
    if (confirmarSenha !== undefined) {
      if (!confirmarSenha || confirmarSenha.length === 0) {
        this.setError('confirmarSenha', 'Confirmação de senha é obrigatória');
        hasErrors = true;
      } else if (senha !== confirmarSenha) {
        this.setError('confirmarSenha', 'As senhas não coincidem');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      this.set({ loading: false });
      return false;
    }

    try {
      const { token } = await container.registerUseCase.exec(nome, username, email, senha);
      await secure.setItem('auth_token', token);
      this.set({ loading: false, token });
      return true;
    } catch (e:any) {
      this.setError('geral', e.message ?? "Erro ao cadastrar");
      this.set({ loading: false });
      return false;
    }
  }

  async logout() {
    await secure.deleteItem('auth_token');
    this.set({ token: undefined });
  }
}
