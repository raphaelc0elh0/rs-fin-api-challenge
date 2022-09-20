import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let user: User;

const mockedStatement = {
  type: OperationType["DEPOSIT"],
  amount: 100,
  description: "Test Description",
};

describe("AuthenticateUserUseCase", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    user = await createUserUseCase.execute({
      name: "Test User",
      email: "user@email.com",
      password: "password",
    });
  });

  it("should be able to create statement", async () => {
    if (user.id) {
      const createdStatement = await createStatementUseCase.execute({
        ...mockedStatement,
        user_id: user.id,
      });
      expect(createdStatement).toHaveProperty("id");
      expect(createdStatement.user_id).toBe(user.id);
    }
  });

  it("should not be able to create statement if user not found", async () => {
    try {
      await createStatementUseCase.execute({
        ...mockedStatement,
        user_id: "not_an_user_id",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(CreateStatementError.UserNotFound);
    }
  });

  it("should not be able to create statement if user has insufficient funds", async () => {
    try {
      if (user.id) {
        await createStatementUseCase.execute({
          ...mockedStatement,
          user_id: user.id,
          type: OperationType["WITHDRAW"],
        });
      }
    } catch (error) {
      expect(error).toBeInstanceOf(CreateStatementError.InsufficientFunds);
    }
  });
});
