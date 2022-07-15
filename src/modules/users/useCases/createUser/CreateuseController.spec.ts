import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";


describe("Create user controller test", () => {

    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    })

    afterAll(async ()  => {
        await connection.dropDatabase();
        await connection.close();
    })
    
    it("Should be able o create a user - controller", async () => {
        const response = await request(app).post("/users").send({
            name: "Thiago",
            email: "thiago@gmail.com",
            password: "12345"
        })

        expect(response.status).toBe(201)
    })
})