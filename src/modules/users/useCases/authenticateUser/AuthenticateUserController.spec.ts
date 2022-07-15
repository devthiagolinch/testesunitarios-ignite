import { Connection, createConnection, SimpleConsoleLogger } from "typeorm";
import request from "supertest";
import { hash } from "bcryptjs";
import {v4 as uuidV4} from "uuid"

import { app } from "../../../../app";


describe("Authenticate user test - CONTROLLER", () => {

    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    
        const id = uuidV4();
        const password = await hash("admin", 8);
    
        await connection.query(
          `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
          values('${id}', 'Thiago', 'thiago@admin.com.br', '${password}', 'now()', 'now()')
        `
        );
      });
    
      afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
        });

    it("Should be able to authenticate a user", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: "thiago@admin.com.br",
            password: "admin"
        });

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("user")
        expect(response.body).toHaveProperty("token")
    })

})