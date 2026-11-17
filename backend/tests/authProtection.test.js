import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../src/app.js"

describe("protected routes", () => {
    it("rejects a request with no token", async () => {
        const res = await request(app).get("/api/logs")
        expect([401, 403]).toContain(res.status)
    })
})