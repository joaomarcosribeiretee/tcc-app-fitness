import { AuthRepository } from "../../domain/repositories/AuthRepository";

const users = new Map<string, { id: string; nome: string; email: string; senhaHash: string }>();

export class InMemoryAuthRepository implements AuthRepository {
  async login(email: string, senha: string) {
    await wait();
    const u = Array.from(users.values()).find(x => x.email === email);
    if (!u || u.senhaHash !== hash(senha)) throw new Error("Credenciais inválidas");
    return { token: "mock."+u.id };
  }

  async register(nome: string, email: string, senha: string) {
    await wait();
    if (Array.from(users.values()).some(x => x.email === email)) throw new Error("Email já em uso");
    const id = cryptoId();
    users.set(id, { id, nome, email, senhaHash: hash(senha) });
    return { token: "mock."+id };
  }

  async me(token: string) {
    await wait();
    const id = token.split(".")[1];
    const u = users.get(id);
    if (!u) throw new Error("Não autenticado");
    return { id: u.id, nome: u.nome, email: u.email };
  }
}

const wait = (ms=400)=> new Promise(r=>setTimeout(r,ms));
const hash = (s:string)=> "h:"+s;           // stub
const cryptoId = ()=> Math.random().toString(36).slice(2);
