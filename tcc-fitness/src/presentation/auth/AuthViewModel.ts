import { container } from "../../di/container";

type AuthState = {
  loading: boolean;
  error?: string;
  token?: string;
};

export class AuthViewModel {
  state: AuthState = { loading: false };
  constructor(private emit: (s: AuthState)=>void) {}

  private set(next: Partial<AuthState>) {
    this.state = { ...this.state, ...next };
    this.emit(this.state);
  }

  async login(email: string, senha: string) {
    this.set({ loading: true, error: undefined });
    try {
      const { token } = await container.loginUseCase.exec(email, senha);
      this.set({ loading: false, token });
    } catch (e:any) {
      this.set({ loading: false, error: e.message ?? "Erro ao entrar" });
    }
  }

  async register(nome: string, email: string, senha: string) {
    this.set({ loading: true, error: undefined });
    try {
      const { token } = await container.registerUseCase.exec(nome, email, senha);
      this.set({ loading: false, token });
    } catch (e:any) {
      this.set({ loading: false, error: e.message ?? "Erro ao cadastrar" });
    }
  }
}
