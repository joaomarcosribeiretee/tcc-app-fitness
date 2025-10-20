import { AuthRepository } from "../entities/AuthRepository";

export class RegisterUseCase {
  constructor(private repo: AuthRepository) {}

  async exec(nome: string, username: string, email: string, senha: string) {
    if (!nome || !username || !email || !senha) throw new Error("Campos obrigatórios");
    return this.repo.register(nome, username, email, senha);
  }
}
