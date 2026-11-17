import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest"
import request from "supertest"
import app from "../src/app.js"
import FoodLog from "../src/models/foodLogModel.js"
import { connectTestDB, clearTestDB, closeTestDB } from "./helpers/db.js"
import { registerAndLogin } from "./helpers/users.js"

beforeAll(connectTestDB)
afterEach(clearTestDB)
afterAll(closeTestDB)

const oats = { name: "Oats", calories: 300, protein: 10, carbs: 50, fat: 5, mealType: "breakfast" }

async function addLog(token) {
    const res = await request(app)
        .post("/api/logs")
        .set("Authorization", `Bearer ${token}`)
        .send(oats)
    return res.body
}

describe("food logs ownership", () => {
    it("lets the owner delete their own log", async () => {
        const alice = await registerAndLogin("alice")
        const log = await addLog(alice.token)

        const res = await request(app)
            .delete(`/api/logs/${log._id}`)
            .set("Authorization", `Bearer ${alice.token}`)

        expect(res.status).toBe(200)
        expect(await FoodLog.findById(log._id)).toBeNull()
    })

    it("blocks another user from deleting it", async () => {
        const alice = await registerAndLogin("alice")
        const bob = await registerAndLogin("bob")
        const log = await addLog(alice.token)

        const res = await request(app)
            .delete(`/api/logs/${log._id}`)
            .set("Authorization", `Bearer ${bob.token}`)

        expect(res.status).toBe(404)
        expect(await FoodLog.findById(log._id)).not.toBeNull()
    })
})