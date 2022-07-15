
import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"


describe("Creating a user", () => {

    let userRepositoryInMemory: InMemoryUsersRepository
    let createUserUseCase: CreateUserUseCase

    beforeAll(() => {
        userRepositoryInMemory = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(userRepositoryInMemory)
    })

    it("Should be able to create a user", async () => {

        const user = await createUserUseCase.execute({
            name: "Thiago",
            email: "thiago@thiago.com",
            password: "12345"
        })

        expect(user).toHaveProperty("id")
    })

    it("Should not be able to create a existent user", async () => {
        await expect(
            createUserUseCase.execute({
                name: "Thiago",
                email: "thiago@thiago.com",
                password: "12345"
            })
        ).rejects.toEqual(new AppError("User already exists"))

    })
})