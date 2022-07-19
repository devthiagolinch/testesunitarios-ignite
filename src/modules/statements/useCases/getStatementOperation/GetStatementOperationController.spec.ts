import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm"
import request from "supertest"
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

describe("Get statement operation from a user account", () => {

    let connection: Connection;

    let authenticate: any;
    let statement: any;

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

        statement = await request(app).post("/api/v1/statements/deposit").auth(authenticate.body.token, {type: "bearer"}).send({
            amount: 800,
            description: "Salary 2",
        });
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("Should be able to request a statement operance from a user account", async () => {
        const token = authenticate.body.token as string;

        const response = await request(app).get(`/api/v1/statements/${statement.body.id}`).auth(token, { type: "bearer" });

        expect(response.body.id).toEqual(statement.body.id);
        expect(response.body.amount).toBe("800.00");
        expect(response.body.description).toBe("Salary 2")
    });
})