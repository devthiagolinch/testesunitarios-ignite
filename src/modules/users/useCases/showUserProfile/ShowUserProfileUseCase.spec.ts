import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"

import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


describe("User profile test - USECASE", () => {

    let userRepository: InMemoryUsersRepository;
    let createUser: CreateUserUseCase;
    let authenticateUser: AuthenticateUserUseCase;
    let userProfile: ShowUserProfileUseCase;

    beforeEach(() => {
        userRepository = new InMemoryUsersRepository();
        createUser = new CreateUserUseCase(userRepository)
        authenticateUser = new AuthenticateUserUseCase(userRepository);
        userProfile = new ShowUserProfileUseCase(userRepository);
    })

    it("Should be able to show user profile", async () => {
        await createUser.execute({
            name: "Thiago",
            email: "thiago@thiago.com",
            password: "12345"
        });
        const authenticate = await authenticateUser.execute({
            email: "thiago@thiago.com",
            password: "12345"
        })

        const response = await userProfile.execute(
            authenticate.user.id as string
        )

        expect(response).toHaveProperty("id")
        expect(response.email).toBe("thiago@thiago.com")
        expect(response.name).toBe("Thiago")
    });

    it("Should not be able to get profile from a non existent user", async () => {
        await expect(
            userProfile.execute("1233321")
        ).rejects.toEqual(new AppError('User not found', 404))
    })
})