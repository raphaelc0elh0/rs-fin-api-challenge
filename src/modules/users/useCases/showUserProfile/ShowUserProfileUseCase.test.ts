import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

const mockedUser = {
  email: "test@email.com",
  password: "Test Password",
};

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to return user", async () => {
    const createdUser = await createUserUseCase.execute({
      ...mockedUser,
      name: "Test User",
    });

    if (createdUser.id) {
      const response = await showUserProfileUseCase.execute(createdUser.id);
      expect(response).toBeInstanceOf(User);
    }
  });

  it("should not be able to return user if not found", async () => {
    try {
      await showUserProfileUseCase.execute("id");
    } catch (error) {
      expect(error).toBeInstanceOf(ShowUserProfileError);
    }
  });
});
