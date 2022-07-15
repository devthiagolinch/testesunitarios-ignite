import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";


describe("Authenticate user test", () => {

    let userRepository: InMemoryUsersRepository;
    let createUserUseCase: CreateUserUseCase;
    let authenticateUserUseCase: AuthenticateUserUseCase;

    beforeEach(() => {
        userRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(userRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
    })

    it("Should be able to a user authenticate - USECASE", async () => {
        await createUserUseCase.execute({
            name: "Thiago",
            email: "thiago@thiago.com",
            password: "12345"
        });

        const authenticateUser = await authenticateUserUseCase.execute({
            email: "thiago@thiago.com",
            password: "12345"
        });

        expect(authenticateUser).toHaveProperty("token")
    })

    it("Should not be able to a user authenticate with wrong e-mail - USECASE", async () => {
        const user = await createUserUseCase.execute({
            name: "Thiago",
            email: "thiago@gmail.com",
            password: "12345"
        });

        await expect(
            authenticateUserUseCase.execute({
            email: "thiago@thiago.com",
            password: "12345" })
        ).rejects.toEqual(new AppError("Incorrect email or password", 401))
    })

    it("Should not be able to a user authenticate with wrong informations - USECASE", async () => {
        const user = await createUserUseCase.execute({
            name: "Thiago",
            email: "thiago@thiago.com",
            password: "12345"
        });

        await expect(
            authenticateUserUseCase.execute({
            email: "thiago@thiago.com",
            password: "123455" })
        ).rejects.toEqual(new AppError("Incorrect email or password", 401))
    })
})