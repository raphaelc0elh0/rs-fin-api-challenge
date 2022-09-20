import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

const mockedUser = {
  email: "test@email.com",
  password: "Test Password",
};

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate user", async () => {
    await createUserUseCase.execute({ ...mockedUser, name: "Test User" });
    const response = await authenticateUserUseCase.execute({
      email: mockedUser.email,
      password: mockedUser.password,
    });
    expect(response).toHaveProperty("token");
    expect(response.user).toHaveProperty("id");
    expect(response.user.email).toBe(mockedUser.email);
  });

  it("should not be able to authenticate user if not an user", async () => {
    expect.assertions(1);

    try {
      await authenticateUserUseCase.execute({
        email: "notanuser@email.com",
        password: "password",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEmailOrPasswordError);
    }
  });

  it("should not be able to authenticate user if password does not match", async () => {
    expect.assertions(1);

    await createUserUseCase.execute({
      ...mockedUser,
      name: "Test User",
      password: "password",
    });

    try {
      await authenticateUserUseCase.execute({
        email: mockedUser.email,
        password: "anotherpassword",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(IncorrectEmailOrPasswordError);
    }
  });
});
