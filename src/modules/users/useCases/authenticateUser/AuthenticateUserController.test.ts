import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

const mockedUser = {
  email: "test@email.com",
  password: "password",
};

describe("AuthenticateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  beforeEach(async () => {
    await request(app)
      .post("/api/v1/users")
      .send({ ...mockedUser, name: "Test Name" });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    const { email, password } = mockedUser;
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });

    expect(response.status).toBe(200);
  });

  it("should not be able to authenticate user if wrong password", async () => {
    const { email } = mockedUser;
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password: "wrong_password" });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate user if user not found", async () => {
    const { password } = mockedUser;
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "wrong_email@email.com", password });

    expect(response.status).toBe(401);
  });
});
