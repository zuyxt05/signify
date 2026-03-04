import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("Middleware Tests", () => {
    // ==========================================
    // Error Handling Middleware
    // ==========================================
    describe("Error Handling", () => {
        it("should return 404 for non-existent routes", async () => {
            const res = await request(app).get("/api/nonexistent-route");
            expect(res.statusCode).toBe(404);
        });

        it("should handle malformed JSON body", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .set("Content-Type", "application/json")
                .send("{invalid json}");

            expect(res.statusCode).toBe(400);
        });
    });

    // ==========================================
    // Auth Middleware
    // ==========================================
    describe("Auth Middleware", () => {
        it("should reject requests without Authorization header", async () => {
            const res = await request(app).get("/api/users");
            expect(res.statusCode).toBe(401);
        });

        it("should reject requests with invalid token", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Authorization", "Bearer invalid.token.here");

            expect(res.statusCode).toBe(401);
        });

        it("should reject requests with malformed Authorization header", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Authorization", "NotBearer something");

            expect(res.statusCode).toBe(401);
        });
    });

    // ==========================================
    // Validation Middleware
    // ==========================================
    describe("Input Validation", () => {
        it("should reject signup with invalid email format", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({ name: "Test", email: "not-an-email", password: "123456" });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("errors");
        });

        it("should reject signup with short password", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({ name: "Test", email: "valid@test.com", password: "12" });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("errors");
        });

        it("should reject meeting with invalid date format", async () => {
            // First login
            const unique = `val_${Date.now()}@test.com`;
            await request(app)
                .post("/api/auth/signup")
                .send({ name: "Validator", email: unique, password: "Test123456" });
            const loginRes = await request(app)
                .post("/api/auth/login")
                .send({ email: unique, password: "Test123456" });
            const token = loginRes.body.token;

            const res = await request(app)
                .post("/api/meetings")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    meetingCode: "VAL-TEST",
                    date: "not-a-date",
                    time: "14:00",
                });

            expect(res.statusCode).toBe(400);
        });
    });

    // ==========================================
    // Security Headers
    // ==========================================
    describe("Security Headers", () => {
        it("should include X-Content-Type-Options header", async () => {
            const res = await request(app).get("/api/meetings");
            expect(res.headers["x-content-type-options"]).toBe("nosniff");
        });

        it("should include X-Frame-Options header", async () => {
            const res = await request(app).get("/api/meetings");
            expect(res.headers["x-frame-options"]).toBe("DENY");
        });

        it("should include X-XSS-Protection header", async () => {
            const res = await request(app).get("/api/meetings");
            expect(res.headers["x-xss-protection"]).toBe("1; mode=block");
        });
    });
});
