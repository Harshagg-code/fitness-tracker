import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest"
import request from "supertest"
import app from "../src/app.js"
import User from "../src/models/userModel.js"
import Weight from "../src/models/weightModel.js"
import { connectTestDB, clearTestDB, closeTestDB } from "./helpers/db.js"
import { registerAndLogin } from "./helpers/users.js"

beforeAll(connectTestDB)
afterEach(clearTestDB)
afterAll(closeTestDB)

const auth = (token) => ({ Authorization: `Bearer ${token}` })

describe("weight", () => {
    it("only lets the starting weight be set once", async () => {
        const alice = await registerAndLogin("alice")

        const first = await request(app)
            .post("/api/weight/start").set(auth(alice.token)).send({ weight: 80 })
        expect(first.status).toBe(200)

        const second = await request(app)
            .post("/api/weight/start").set(auth(alice.token)).send({ weight: 70 })
        expect(second.status).toBe(400)
    })

    it("overwrites today's daily log instead of adding a second one", async () => {
        const alice = await registerAndLogin("alice")
        await request(app).post("/api/weight").set(auth(alice.token)).send({ weight: 80 })
        await request(app).post("/api/weight").set(auth(alice.token)).send({ weight: 79.5 })

        const res = await request(app).get("/api/weight/history").set(auth(alice.token))
        expect(res.body.dailyLogs).toHaveLength(1)
        expect(res.body.dailyLogs[0].weight).toBe(79.5)
    })

    it("returns the newest 30 daily logs, oldest first", async () => {
        const alice = await registerAndLogin("alice")
        const user = await User.findOne({ email: alice.email })

        const docs = Array.from({ length: 40 }, (_, i) => ({
            userId: user._id,
            weight: 80 + i * 0.1,
            type: "daily",
            date: new Date(Date.UTC(2026, 0, i + 1)).toISOString().split("T")[0],
        }))
        await Weight.insertMany(docs)

        const res = await request(app).get("/api/weight/history").set(auth(alice.token))
        const logs = res.body.dailyLogs

        expect(logs).toHaveLength(30)
        expect(logs[0].date).toBe("2026-01-11")
        expect(logs[29].date).toBe("2026-02-09")
    })
})