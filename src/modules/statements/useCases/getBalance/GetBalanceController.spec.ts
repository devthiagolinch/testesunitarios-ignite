import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm"
import { v4 as uuidV4 } from "uuid";
import request from "supertest"

import { app } from "../../../../app";

describe("Get balance of a user - CONTROLLER", () => {

    let connection: Connection;
    let authenticate: any;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();


        const id = uuidV4();
        const password = await hash("thiago", 8);

        await connection.query(
            `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
          values('${id}', 'Thiago', 'thiago@admin.com.br', '${password}', 'now()', 'now()')
            `
        );

        authenticate = await request(app).post("/api/v1/sessions").send({
            email: "thiago@admin.com.br",
            password: "thiago"
        });

        await request(app).post("/api/v1/statements/deposit").auth(authenticate.body.token, {type: "bearer"}).send({
            amount: 800,
            description: "Salary 2",
        });

        await request(app).post("/api/v1/statements/withdraw").auth(authenticate.body.token, {type: "bearer"}).send({
            amount: 30,
            description: "withdraw 1",
        });

        await request(app).post("/api/v1/statements/withdraw").auth(authenticate.body.token, {type: "bearer"}).send({
            amount: 750,
            description: "withdraw 2",
        });
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("Should be to send informations to get a statement relation of a user account",async () => {

        const token = authenticate.body.token as string;

        const response = await request(app).get("/api/v1/statements/balance").auth(token, { type: "bearer"})
        console.log(response)
        
        expect(response.body.statement.length).toBe(3)
        expect(response.body.balance).toBe(20)
    })
})