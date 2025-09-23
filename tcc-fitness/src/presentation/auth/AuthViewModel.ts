import { container } from "../../di/container";
import * as secure from "../../infra/secureStore";

type AuthState = {
  loading: boolean;
  error?: string;
  token?: string;
};

export class AuthViewModel {
  state: AuthState = { loading: false };
  constructor(private emit: (s: AuthState)=>void) {}

  async bootstrap() {
    this.set({ loading: true, error: undefined });
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
    this.state = { ...this.state, ...next };
    this.emit(this.state);
  }

  private isValidEmail(email: string): boolean {
    // RFC 5322 pragmatic email regex (strict but practical)
    const re = /^(?:[a-zA-Z0-9_'^&+-])+(?:\.(?:[a-zA-Z0-9_'^&+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  }

  async login(email: string, senha: string): Promise<boolean> {
    this.set({ loading: true, error: undefined });
    try {
      if (!this.isValidEmail(email)) {
        throw new Error("Email inválido");
      }
      if (!senha || senha.length < 6) {
        throw new Error("Senha deve ter ao menos 6 caracteres");
      }
      const { token } = await container.loginUseCase.exec(email, senha);
      await secure.setItem('auth_token', token);
      this.set({ loading: false, token });
      return true;
    } catch (e:any) {
      this.set({ loading: false, error: e.message ?? "Erro ao entrar" });
      return false;
    }
  }

  async register(nome: string, email: string, senha: string): Promise<boolean> {
    this.set({ loading: true, error: undefined });
    try {
      if (!nome || nome.trim().length < 2) {
        throw new Error("Informe um nome válido");
      }
      if (!this.isValidEmail(email)) {
        throw new Error("Email inválido");
      }
      if (!senha || senha.length < 6) {
        throw new Error("Senha deve ter ao menos 6 caracteres");
      }
      const { token } = await container.registerUseCase.exec(nome, email, senha);
      await secure.setItem('auth_token', token);
      this.set({ loading: false, token });
      return true;
    } catch (e:any) {
      this.set({ loading: false, error: e.message ?? "Erro ao cadastrar" });
      return false;
    }
  }

  async logout() {
    await secure.deleteItem('auth_token');
    this.set({ token: undefined });
  }
}
