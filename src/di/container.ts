import { InMemoryAuthRepository } from "../domain/repositories/InMemoryAuthRepository";
import { LoginUseCase } from "../domain/usecases/LoginUseCase";
import { RegisterUseCase } from "../domain/usecases/RegisterUseCase";

const authRepo = new InMemoryAuthRepository();

export const container = {
  loginUseCase: new LoginUseCase(authRepo),
  registerUseCase: new RegisterUseCase(authRepo),
};
