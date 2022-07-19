import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";
import { app } from "../../../../app";


describe("Create statement - CONTROLLER", () => {

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
        })
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("Should be able to create a statement - DEPOSIT", async () => {
        const token = authenticate.body.token;

        const responseStatement = await request(app).post("/api/v1/statements/deposit").auth(token, {type: "bearer"}).send({
            amount: 300,
            description: "deposit",
        })

        expect(responseStatement.status).toBe(201);
        expect(responseStatement.body.amount).toEqual(300);
    });

    it("Should be able to create a statement - WITHDRAW", async () => {
        const token = authenticate.body.token;

        const responseStatement = await request(app).post("/api/v1/statements/withdraw").auth(token, {type: "bearer"}).send({
            amount: 30,
            description: "withdraw",
        })

        expect(responseStatement.status).toBe(201);
        expect(responseStatement.body.amount).toEqual(30);
        expect(responseStatement.body.description).toBe("withdraw")
    })

    it("Should not be able to create any statement to a nonexistent user", async () => {

        const responseStatement = await request(app).post("/api/v1/statements/withdraw").auth("token", {type: "bearer"}).send({
            amount: 30,
            description: "withdraw",
        });


        expect(responseStatement.status).toBe(401);
    })
})