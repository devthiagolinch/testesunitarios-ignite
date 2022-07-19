import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


describe("Get statement operation from a user account", () => {

    let userRepository: InMemoryUsersRepository;
    let user_id: any;

    let statementRepository: InMemoryStatementsRepository;
    let statement: Statement;
    let getStatementOperationUseCase: GetStatementOperationUseCase;


    enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw",
    }

    beforeEach(async () => {
        userRepository = new InMemoryUsersRepository();
        statementRepository = new InMemoryStatementsRepository();
        getStatementOperationUseCase = new GetStatementOperationUseCase(userRepository, statementRepository);

        const user = await userRepository.create({
            name: "Thiago",
            email: "thiago@thiago.com",
            password: "12345"
        })

        user_id = user.id as string;

        statement = await statementRepository.create({
            amount: 3000,
            description: "Salary",
            type: OperationType.DEPOSIT,
            user_id
        });

        await statementRepository.create({
            amount: 30,
            description: "BK",
            type: OperationType.WITHDRAW,
            user_id
        });
    })

    it("Should be able to get statements operation from a user account", async () => {
        const statement_id = statement.id as string;

        const response = await getStatementOperationUseCase.execute({
            user_id,
            statement_id
        });

        expect(response.id).toEqual(statement_id);
        expect(response.amount).toBe(3000);
        expect(response.description).toEqual("Salary")
    });

    it("Should not be able to get statements operation from a nonexistent user account", async () => {
        const statement_id = statement.id as string;

        await expect(
            getStatementOperationUseCase.execute({
                user_id: "fasfgagasddf",
                statement_id
            })
        ).rejects.toEqual(new AppError('User not found', 404));
    });

    it("Should not be able to get nonexistent statements operation from a user account", async () => {
        const statement_id = "fasgavty";

        await expect(
            getStatementOperationUseCase.execute({
                user_id,
                statement_id
            })
        ).rejects.toEqual(new AppError('Statement not found', 404));
    });
})