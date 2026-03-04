import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

// NOTE: These tests require a running PostgreSQL and Redis instance
// configured via .env file

describe("Auth API", () => {
    const testUser = {
        name: "Test User",
        email: `test_${Date.now()}@signify.com`,
        password: "Test123456",
    };
    let authToken = null;

    // ==========================================
    // POST /api/auth/signup
    // ==========================================
    describe("POST /api/auth/signup", () => {
        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send(testUser);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("email", testUser.email);
            expect(res.body).toHaveProperty("name", testUser.name);
            // Password should NOT be returned
            expect(res.body.password).toBeUndefined();
        });

        it("should reject duplicate email", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send(testUser);

            expect(res.statusCode).toBe(409);
        });

        it("should reject missing email", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({ name: "No Email", password: "123456" });

            expect(res.statusCode).toBe(400);
        });

        it("should reject missing password", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({ name: "No Pass", email: "nopass@test.com" });

            expect(res.statusCode).toBe(400);
        });
    });

    // ==========================================
    // POST /api/auth/login
    // ==========================================
    describe("POST /api/auth/login", () => {
        it("should login with valid credentials", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: testUser.email, password: testUser.password });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("email", testUser.email);

            authToken = res.body.token;
        });

        it("should reject wrong password", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: testUser.email, password: "wrongpassword" });

            expect(res.statusCode).toBe(401);
        });

        it("should reject non-existent email", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "notexist@test.com", password: "123456" });

            expect(res.statusCode).toBe(401);
        });
    });

    // ==========================================
    // POST /api/auth/logout
    // ==========================================
    describe("POST /api/auth/logout", () => {
        it("should logout successfully with valid token", async () => {
            // First login to get a fresh token
            const loginRes = await request(app)
                .post("/api/auth/login")
                .send({ email: testUser.email, password: testUser.password });

            const token = loginRes.body.token;

            const res = await request(app)
                .post("/api/auth/logout")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("message", "Logged out successfully");
        });

        it("should reject logout without token", async () => {
            const res = await request(app)
                .post("/api/auth/logout");

            expect(res.statusCode).toBe(401);
        });
    });
});
