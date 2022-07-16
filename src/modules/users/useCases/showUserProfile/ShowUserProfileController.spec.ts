import { hash } from "bcryptjs";
import request from "supertest"
import { Connection, createConnection } from "typeorm"
import {v4 as uuidV4} from "uuid"
import { app } from "../../../../app";
import { AppError } from "../../../../shared/errors/AppError";


describe("User profile test - CONTROLLER", () => {

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

    it("Should be able to request the user profile", async () => {
        const userAuth = await request(app).post("/api/v1/sessions").send({
            email: "thiago@admin.com.br",
            password: "admin"
        });

        const token = userAuth.body.token

        const response = await request(app).get("/api/v1/profile").auth(token, {type: "bearer"})

        expect(response.body).toHaveProperty("id")
        expect(response.body.name).toBe("Thiago")
        expect(response.body.email).toBe("thiago@admin.com.br")
    });
    it("Should not be able to get profile fron a non existent user", async () => {
        const response = await request(app).get("/api/v1/profile").auth("kjfkajfekjvh818937rmji", {type: "bearer"})
        
        expect(response.status).toBe(401)
        expect(response.body).toEqual({"message": "JWT invalid token!"})
    })
})