import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import { v4 as uuidV4 } from "uuid";

let connection: Connection;

let token: string;

describe("GetStatementOperationController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      email: "test@email.com",
      password: "password",
      name: "Test Name",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "password",
    });

    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "Test Deposit" })
      .set({ Authorization: `Bearer ${token}` });

    const statement_id = depositResponse.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });

  it("should not be able to get statement if user not found", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "Test Deposit" })
      .set({ Authorization: `Bearer ${token}` });

    const statement_id = depositResponse.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({ Authorization: `Bearer ${"wrong_token"}` });

    expect(response.status).toBe(401);
  });

  it("should not be able to get statement if statement not found", async () => {
    const statement_id = uuidV4();

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  });
});
