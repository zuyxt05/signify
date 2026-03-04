import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("Meeting API", () => {
    let authToken = null;
    let userId = null;
    let meetingId = null;
    const testEmail = `meeting_test_${Date.now()}@signify.com`;

    // Setup: Create user and login
    beforeAll(async () => {
        // Register
        await request(app)
            .post("/api/auth/signup")
            .send({ name: "Meeting Tester", email: testEmail, password: "Test123456" });

        // Login
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: testEmail, password: "Test123456" });

        authToken = loginRes.body.token;
        userId = loginRes.body.user.id;
    });

    // ==========================================
    // POST /api/meetings
    // ==========================================
    describe("POST /api/meetings", () => {
        it("should create a meeting with valid data", async () => {
            const res = await request(app)
                .post("/api/meetings")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    meetingCode: `TEST-${Date.now()}`,
                    title: "Test Meeting",
                    description: "A test meeting",
                    date: "2026-03-15",
                    time: "14:00",
                    duration: 60,
                    host: userId,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("title", "Test Meeting");
            expect(res.body).toHaveProperty("meetingCode");

            meetingId = res.body.id;
        });

        it("should reject meeting without auth", async () => {
            const res = await request(app)
                .post("/api/meetings")
                .send({
                    meetingCode: "NO-AUTH",
                    date: "2026-03-15",
                    time: "14:00",
                });

            expect(res.statusCode).toBe(401);
        });

        it("should reject meeting without required fields", async () => {
            const res = await request(app)
                .post("/api/meetings")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Missing fields" });

            expect(res.statusCode).toBe(400);
        });
    });

    // ==========================================
    // GET /api/meetings
    // ==========================================
    describe("GET /api/meetings", () => {
        it("should return list of meetings", async () => {
            const res = await request(app)
                .get("/api/meetings")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // ==========================================
    // GET /api/meetings/user/:userId
    // ==========================================
    describe("GET /api/meetings/user/:userId", () => {
        it("should return meetings for a specific user", async () => {
            const res = await request(app)
                .get(`/api/meetings/user/${userId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // ==========================================
    // PUT /api/meetings/:id
    // ==========================================
    describe("PUT /api/meetings/:id", () => {
        it("should update a meeting", async () => {
            if (!meetingId) return;

            const res = await request(app)
                .put(`/api/meetings/${meetingId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Updated Meeting Title" });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("title", "Updated Meeting Title");
        });

        it("should return 404 for non-existent meeting", async () => {
            const res = await request(app)
                .put("/api/meetings/99999999-9999-9999-9999-999999999999")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Ghost" });

            expect(res.statusCode).toBe(404);
        });
    });

    // ==========================================
    // DELETE /api/meetings/:id
    // ==========================================
    describe("DELETE /api/meetings/:id", () => {
        it("should delete a meeting", async () => {
            if (!meetingId) return;

            const res = await request(app)
                .delete(`/api/meetings/${meetingId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
        });

        it("should return 404 for already deleted meeting", async () => {
            if (!meetingId) return;

            const res = await request(app)
                .delete(`/api/meetings/${meetingId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.statusCode).toBe(404);
        });
    });
});
