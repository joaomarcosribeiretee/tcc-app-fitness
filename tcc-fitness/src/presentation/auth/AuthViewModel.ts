import { container } from "../../di/container";
import * as SecureStore from "expo-secure-store";

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
      const token = await SecureStore.getItemAsync('auth_token');
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

  async login(email: string, senha: string) {
    this.set({ loading: true, error: undefined });
    try {
      const { token } = await container.loginUseCase.exec(email, senha);
      await SecureStore.setItemAsync('auth_token', token);
      this.set({ loading: false, token });
    } catch (e:any) {
      this.set({ loading: false, error: e.message ?? "Erro ao entrar" });
    }
  }

  async register(nome: string, email: string, senha: string) {
    this.set({ loading: true, error: undefined });
    try {
      const { token } = await container.registerUseCase.exec(nome, email, senha);
      await SecureStore.setItemAsync('auth_token', token);
      this.set({ loading: false, token });
    } catch (e:any) {
      this.set({ loading: false, error: e.message ?? "Erro ao cadastrar" });
    }
  }

  async logout() {
    await SecureStore.deleteItemAsync('auth_token');
    this.set({ token: undefined });
  }
}
