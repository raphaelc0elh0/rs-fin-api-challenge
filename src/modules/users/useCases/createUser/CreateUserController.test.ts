import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

const mockedUser = {
  name: "Test Name",
  email: "test@email.com",
  password: "password",
};

describe("AuthenticateUserUseCase", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create user", async () => {
    const response = await request(app).post("/api/v1/users").send(mockedUser);
    expect(response.status).toBe(201);
  });

  it("should not be able to create user with same email", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({ ...mockedUser, email: "same_email@email.com" });
    const response = await request(app)
      .post("/api/v1/users")
      .send({ ...mockedUser, email: "same_email@email.com" });

    expect(response.status).toBe(400);
  });
});
