import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { STATUS_CODES } from "http";
import { AppError } from "../../../../shared/errors/AppError";


describe("Create a statement - USECASE", () => {

    let userRepository: InMemoryUsersRepository;
    let createUser: CreateUserUseCase;
    let statementRepository: InMemoryStatementsRepository;
    let createStatement: CreateStatementUseCase;

    let authenticateUser: AuthenticateUserUseCase;

    enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw",
    }

    beforeAll(async () => {
        userRepository = new InMemoryUsersRepository();
        createUser = new CreateUserUseCase(userRepository)
        authenticateUser = new AuthenticateUserUseCase(userRepository);
        statementRepository = new InMemoryStatementsRepository();
        createStatement = new CreateStatementUseCase(userRepository, statementRepository);
    })

    it("Should be able to make a deposit", async () => {
        await createUser.execute({
            name: "Thiago",
            email: "thiago@thiago.com",
            password: "12345"
        });

        const userResponse = await authenticateUser.execute({
            email: "thiago@thiago.com",
            password: "12345"
        });

        const userId = userResponse.user.id as string;

        const statement = await createStatement.execute({
            amount: 3000,
            description: "Salary",
            type: OperationType.DEPOSIT,
            user_id: userId
        })

        expect(statement).toHaveProperty("id")
        expect(statement).toHaveProperty("description")
        expect(statement.amount).toBe(3000)
        expect(statement.user_id).toEqual(userId)
    });

    it("Should be able to make a withdraw", async () => {
        const userResponse = await authenticateUser.execute({
            email: "thiago@thiago.com",
            password: "12345"
        });

        const userId = userResponse.user.id as string;

        const statement = await createStatement.execute({
            amount: 300,
            description: "Nubank",
            type: OperationType.WITHDRAW,
            user_id: userId
        })

        expect(statement).toHaveProperty("id")
        expect(statement).toHaveProperty("description")
        expect(statement.amount).toBe(300)
        expect(statement.user_id).toEqual(userId)
    });

    it("Should not be able to make any statement in a nonexistent user", async () => {
        await expect(
            createStatement.execute({
                amount: 300,
                description: "Nubank",
                type: OperationType.WITHDRAW,
                user_id: "27nf2nfh02nv024nt90"
            })
        ).rejects.toEqual(new AppError('User not found', 404))
    });

    it("Should not be able to withdraw without founds", async () => {
        const userResponse = await authenticateUser.execute({
            email: "thiago@thiago.com",
            password: "12345"
        });

        const userId = userResponse.user.id as string;

        await expect(
            createStatement.execute({
                amount: 5000,
                description: "Nubank",
                type: OperationType.WITHDRAW,
                user_id: userId
            })
        ).rejects.toEqual(new AppError('Insufficient funds', 400))
    });
})