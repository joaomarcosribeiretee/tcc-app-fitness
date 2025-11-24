import { InMemoryAuthRepository } from "../domain/repositories/InMemoryAuthRepository";
import { HttpAuthRepository } from "../domain/repositories/HttpAuthRepository";
import { LoginUseCase } from "../domain/usecases/LoginUseCase";
import { RegisterUseCase } from "../domain/usecases/RegisterUseCase";

// Trocar aqui para usar backend real ou mock
const authRepo = new HttpAuthRepository(); // ← Backend Python
// const authRepo = new InMemoryAuthRepository(); // ← Mock (para teste local)

export const container = {
  authRepository: authRepo,
  loginUseCase: new LoginUseCase(authRepo),
  registerUseCase: new RegisterUseCase(authRepo),
};
