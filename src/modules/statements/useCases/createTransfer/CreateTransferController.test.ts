import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import { CreateTransferError } from "./CreateTransferError";
import { v4 as uuidV4 } from "uuid";
import { JWTInvalidTokenError } from "../../../../shared/errors/JWTInvalidTokenError";

let connection: Connection;
let destination_user_id: string;
let destination_user_token: string;
let token: string;

describe("CreateTranferController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    // create transfer destination user
    await request(app).post("/api/v1/users").send({
      email: "to@email.com",
      password: "password",
      name: "To User",
    });

    const responseDestinationUser = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "to@email.com",
        password: "password",
      });
    destination_user_id = responseDestinationUser.body.user.id;
    destination_user_token = responseDestinationUser.body.token;

    // create transfer origin user
    await request(app).post("/api/v1/users").send({
      email: "from@email.com",
      password: "password",
      name: "From User",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "from@email.com",
      password: "password",
    });
    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a transfer statement", async () => {
    await request(app)
      .post(`/api/v1/statements/deposit`)
      .send({ amount: 100, description: "Deposit" })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${destination_user_id}`)
      .send({ amount: 100, description: "Test Transfer" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
  });

  it("should not be able to create transfer if insufficient funds", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${destination_user_id}`)
      .send({ amount: 100, description: "Test Transfer" })
      .set({ Authorization: `Bearer ${token}` });

    const error = new CreateTransferError.InsufficientFunds();
    expect(response.status).toEqual(error.statusCode);
    expect(response.body.message).toEqual(error.message);
  });

  it("should not be able to create transfer if no user", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${destination_user_id}`)
      .send({ amount: 100, description: "Test Transfer" })
      .set({ Authorization: `Bearer ${"invalid-token"}` });

    const error = new JWTInvalidTokenError();
    expect(response.status).toEqual(error.statusCode);
    expect(response.body.message).toEqual(error.message);
  });

  it("should not be able to create transfer if sender not found", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${uuidV4()}`)
      .send({ amount: 100, description: "Test Transfer" })
      .set({ Authorization: `Bearer ${token}` });

    const error = new CreateTransferError.UserNotFound();
    expect(response.status).toEqual(error.statusCode);
    expect(response.body.message).toEqual(error.message);
  });
});
