import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { compare } from "bcryptjs";
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

const mockedUser = {
  name: "Test Name",
  email: "test@email.com",
  password: "password",
};

describe("CreateUserUseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create user", async () => {
    await createUserUseCase.execute(mockedUser);

    const createdUser = await inMemoryUsersRepository.findByEmail(
      "test@email.com"
    );
    expect(createdUser).toHaveProperty("id");
    expect(createdUser?.email).toBe("test@email.com");
  });

  it("should be able to save only hashed passwords", async () => {
    let isMatchingPassword = false;
    const password = "password";
    await createUserUseCase.execute({ ...mockedUser, password });

    const createdUser = await inMemoryUsersRepository.findByEmail(
      "test@email.com"
    );

    if (createdUser) {
      isMatchingPassword = await compare(password, createdUser.password);
    }

    expect(isMatchingPassword).toBe(true);
    expect(createdUser?.password).not.toBe(password);
  });

  it("should not be able to create user with same email", async () => {
    try {
      await createUserUseCase.execute(mockedUser);
      await createUserUseCase.execute(mockedUser);
    } catch (error) {
      expect(error).toBeInstanceOf(CreateUserError);
    }
  });
});
