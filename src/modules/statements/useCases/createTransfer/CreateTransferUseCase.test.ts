import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createTransferUseCase: CreateTransferUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let fromUser: User;
let toUser: User;

describe("CreateTransferUseCase", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createTransferUseCase = new CreateTransferUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    fromUser = await createUserUseCase.execute({
      name: "From User",
      email: "From@email.com",
      password: "password",
    });

    toUser = await createUserUseCase.execute({
      name: "To User",
      email: "to@email.com",
      password: "password",
    });
  });

  it("should be able to create transfer", async () => {
    if (fromUser.id && toUser.id) {
      await createStatementUseCase.execute({
        user_id: fromUser.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Test Transfer",
      });
      const createdTransfer = await createTransferUseCase.execute({
        user_id: toUser.id,
        sender_id: fromUser.id,
        amount: 50,
        description: "Test Transfer",
      });
      expect(createdTransfer).toHaveProperty("id");
    }
  });

  it("should not be able to create transfer if no user", async () => {
    if (toUser.id) {
      try {
        await createTransferUseCase.execute({
          user_id: "wrong-user",
          sender_id: toUser.id,
          amount: 50,
          description: "Test Transfer",
        });
      } catch (error) {
        expect(error).toEqual(new CreateTransferError.UserNotFound());
      }
    }
  });

  it("should not be able to create transfer if no sender", async () => {
    if (fromUser.id) {
      try {
        await createTransferUseCase.execute({
          user_id: fromUser.id,
          sender_id: "wrong-user",
          amount: 50,
          description: "Test Transfer",
        });
      } catch (error) {
        expect(error).toEqual(new CreateTransferError.SenderNotFound());
      }
    }
  });

  it("should not be able to create transfer if insufficient funds", async () => {
    if (fromUser.id && toUser.id) {
      try {
        await createTransferUseCase.execute({
          user_id: toUser.id,
          sender_id: fromUser.id,
          amount: 50,
          description: "Test Transfer",
        });
      } catch (error) {
        expect(error).toEqual(new CreateTransferError.InsufficientFunds());
      }
    }
  });
});
