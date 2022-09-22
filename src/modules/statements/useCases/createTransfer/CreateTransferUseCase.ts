import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";

interface IRequest {
  user_id: string;
  sender_id: string;
  amount: number;
  description: string;
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    sender_id,
    amount,
    description,
  }: IRequest): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);
    if (!user) throw new CreateTransferError.UserNotFound();

    const sender = await this.usersRepository.findById(sender_id);
    if (!sender) throw new CreateTransferError.SenderNotFound();

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });
    if (balance < amount) throw new CreateTransferError.InsufficientFunds();

    const statement = await this.statementsRepository.create({
      user_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    return statement;
  }
}

export { CreateTransferUseCase };
