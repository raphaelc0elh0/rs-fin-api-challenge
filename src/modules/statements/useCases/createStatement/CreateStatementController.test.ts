import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

let token: string;

describe("CreateStatementController", () => {
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

  it("should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "Test Deposit" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
  });

  it("should be able to create a withdraw statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 100, description: "Test Withdraw" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
  });

  it("should not be able to create any statement if user not found", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "Test Deposit" })
      .set({ Authorization: `Bearer ${"wrong-token"}` });
    expect(depositResponse.status).toBe(401);

    const withdrawResponse = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 100, description: "Test Withdraw" })
      .set({ Authorization: `Bearer ${"wrong-token"}` });
    expect(withdrawResponse.status).toBe(401);
  });

  it("should not be able to withdraw if insufficient funds", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "Test Deposit" })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 200, description: "Test Withdraw" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });
});
