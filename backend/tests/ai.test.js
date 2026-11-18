import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from "vitest"
import request from "supertest"
import { connectTestDB, clearTestDB, closeTestDB } from "./helpers/db.js"
import { registerAndLogin } from "./helpers/users.js"

// vi.mock is hoisted above imports, so the spy must be created with vi.hoisted
const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))

vi.mock("@anthropic-ai/sdk", () => ({
    default: class {
        constructor() {
            this.messages = { create: createMock }
        }
    }
}))

import app from "../src/app.js"

beforeAll(async () => {
    await connectTestDB()
})

afterEach(async () => {
    await clearTestDB()
    createMock.mockReset()
})

afterAll(async () => {
    await closeTestDB()
})

describe("POST /api/ai/advice", () => {
    it("rejects requests without a token and never calls the AI", async () => {
        const res = await request(app)
            .post("/api/ai/advice")
            .send({ messages: [{ role: "user", content: "hi" }] })

        expect([401, 403]).toContain(res.status)
        expect(createMock).not.toHaveBeenCalled()
    })

    it("builds the prompt from the user and returns the AI reply", async () => {
        createMock.mockResolvedValue({ content: [{ type: "text", text: "Eat more protein" }] })
        const { username, token } = await registerAndLogin("aiuser")
        const messages = [{ role: "user", content: "What should I eat?" }]

        const res = await request(app)
            .post("/api/ai/advice")
            .set("Authorization", `Bearer ${token}`)
            .send({ messages })

        expect(res.status).toBe(200)
        expect(res.body.reply).toBe("Eat more protein")

        expect(createMock).toHaveBeenCalledTimes(1)
        const args = createMock.mock.calls[0][0]
        expect(args.messages).toEqual(messages)
        expect(args.system).toContain(username)
        expect(args.system).toContain("Nothing logged yet")
    })

    it("returns 500 when the AI call fails", async () => {
        createMock.mockRejectedValue(new Error("Anthropic is down"))
        const { token } = await registerAndLogin("aiuser2")
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => { })

        const res = await request(app)
            .post("/api/ai/advice")
            .set("Authorization", `Bearer ${token}`)
            .send({ messages: [{ role: "user", content: "hi" }] })

        expect(res.status).toBe(500)
        logSpy.mockRestore()
    })
})