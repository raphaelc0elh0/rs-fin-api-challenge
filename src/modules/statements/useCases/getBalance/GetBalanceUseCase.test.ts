import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let user: User;

describe("GetBalanceUseCase", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    user = await createUserUseCase.execute({
      name: "Test User",
      email: "user@email.com",
      password: "password",
    });
  });

  it("should be able to get users balance", async () => {
    if (user.id) {
      const userBalance = await getBalanceUseCase.execute({ user_id: user.id });
      expect(userBalance).toHaveProperty("statement");
      expect(userBalance).toHaveProperty("balance");
    }
  });

  it("should not be able to get users balance if user not found", async () => {
    try {
      await getBalanceUseCase.execute({
        user_id: "not_an_user_id",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(GetBalanceError);
    }
  });
});
