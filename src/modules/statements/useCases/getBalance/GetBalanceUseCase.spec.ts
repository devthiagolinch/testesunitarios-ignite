import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


describe("Get balance of a user - USECASE", () => {

    let userId: any;

    let userRepository: InMemoryUsersRepository;
    let createUser: CreateUserUseCase;

    let createStatement: CreateStatementUseCase;
    let statementRepository: InMemoryStatementsRepository;
    let getBalanceUseCase: GetBalanceUseCase;

    enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw",
    }

    beforeAll(async () => {
        userRepository = new InMemoryUsersRepository();
        createUser = new CreateUserUseCase(userRepository);


        statementRepository = new InMemoryStatementsRepository();
        createStatement = new CreateStatementUseCase(userRepository, statementRepository);
        getBalanceUseCase = new GetBalanceUseCase(statementRepository, userRepository);

        const user = await createUser.execute({
            name: "Thiago",
            email: "thiago@thiago.com",
            password: "12345"
        });

        userId = user.id as string;

        await createStatement.execute({
            amount: 3000,
            description: "Salary",
            type: OperationType.DEPOSIT,
            user_id: userId
        });

        await createStatement.execute({
            amount: 10,
            description: "Lunch",
            type: OperationType.WITHDRAW,
            user_id: userId
        });

        await createStatement.execute({
            amount: 200,
            description: "Apartament rental",
            type: OperationType.WITHDRAW,
            user_id: userId
        })
    });

    it("Should be able to get a balance of a user account", async () => {

        const user_id = userId as string;

        const responseGet = await getBalanceUseCase.execute({user_id})
        
        expect(responseGet.statement.length).toBe(3)
        expect(responseGet.balance).toBe(2790)
    })

    it("Should not be able to get a balance of a non-existent user", async () => {
        const user_id = "kljieciaçgjie-fs-dsfdsc"

        await expect(
            getBalanceUseCase.execute({user_id})
        ).rejects.toEqual(new AppError('User not found', 404))
    })
})