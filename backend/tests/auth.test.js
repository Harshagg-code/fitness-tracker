import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest"
import request from "supertest"
import app from "../src/app.js"
import { connectTestDB, clearTestDB, closeTestDB } from "./helpers/db.js"

beforeAll(connectTestDB)
afterEach(clearTestDB)
afterAll(closeTestDB)

const user = { username: "alice", email: "alice@test.com", password: "Password123!" }

describe("auth", () => {
    it("registers a new user", async () => {
        const res = await request(app).post("/api/auth/register").send(user)
        expect(res.status).toBeLessThan(300)
    })

    it("rejects a duplicate email with 409", async () => {
        await request(app).post("/api/auth/register").send(user)
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...user, username: "alice2" })
        expect(res.status).toBe(409)
    })

    it("logs in and returns tokens", async () => {
        await request(app).post("/api/auth/register").send(user)
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: user.password })
        expect(res.status).toBe(200)
        expect(res.body.accessToken).toBeTruthy()
        expect(res.body.refreshToken).toBeTruthy()
    })

    it("rejects a wrong password", async () => {
        await request(app).post("/api/auth/register").send(user)
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: "wrong-password" })
        expect(res.status).toBeGreaterThanOrEqual(400)
        expect(res.body.accessToken).toBeUndefined()
    })
})