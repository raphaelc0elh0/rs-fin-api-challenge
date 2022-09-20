import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

let token: string;

describe("ShowUserProfileController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  beforeEach(async () => {
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

  it("should be able to return user", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });

  it("should not be able to return user if no wrong token", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Bearer ${"wrong-token"}` });

    expect(response.status).toBe(401);
  });
});
