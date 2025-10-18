import { AuthRepository } from "../entities/AuthRepository";

export class RegisterUseCase {
  constructor(private repo: AuthRepository) {}

  async exec(nome: string, email: string, senha: string) {
    if (!nome || !email || !senha) throw new Error("Campos obrigatórios");
    return this.repo.register(nome, email, senha);
  }
}
