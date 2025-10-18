import { AuthRepository } from "../entities/AuthRepository";

export class LoginUseCase {
  constructor(private repo: AuthRepository) {}

  async exec(email: string, senha: string) {
    if (!email || !senha) throw new Error("Informe email e senha");
    return this.repo.login(email, senha);
  }
}
