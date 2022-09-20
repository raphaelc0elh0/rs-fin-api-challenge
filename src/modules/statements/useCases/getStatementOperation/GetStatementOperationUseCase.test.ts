import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
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

  it("should be able to get statement", async () => {
    if (user.id) {
      const createdStatement = await createStatementUseCase.execute({
        ...mockedStatement,
        user_id: user.id,
      });

      if (createdStatement.id) {
        const statement = await getStatementOperationUseCase.execute({
          user_id: user.id,
          statement_id: createdStatement.id,
        });
        expect(statement).toHaveProperty("id");
        expect(statement).toBeInstanceOf(Statement);
      }
    }
  });

  it("should not be able to get statement if user not found", async () => {
    try {
      if (user.id) {
        const createdStatement = await createStatementUseCase.execute({
          ...mockedStatement,
          user_id: user.id,
        });

        if (createdStatement.id) {
          await getStatementOperationUseCase.execute({
            user_id: "not_an_user_id",
            statement_id: createdStatement.id,
          });
        }
      }
    } catch (error) {
      expect(error).toBeInstanceOf(GetStatementOperationError.UserNotFound);
    }
  });

  it("should not be able to get statement if statement not found", async () => {
    try {
      if (user.id) {
        await getStatementOperationUseCase.execute({
          user_id: user.id,
          statement_id: "not_a_statement_id",
        });
      }
    } catch (error) {
      expect(error).toBeInstanceOf(
        GetStatementOperationError.StatementNotFound
      );
    }
  });
});
