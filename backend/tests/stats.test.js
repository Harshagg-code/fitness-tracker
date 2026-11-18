import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest"
import request from "supertest"
import app from "../src/app.js"
import User from "../src/models/userModel.js"
import FoodLog from "../src/models/foodLogModel.js"
import { connectTestDB, clearTestDB, closeTestDB } from "./helpers/db.js"
import { registerAndLogin } from "./helpers/users.js"

beforeAll(async () => { await connectTestDB() })
afterEach(async () => { await clearTestDB() })
afterAll(async () => { await closeTestDB() })

const DAY_MS = 24 * 60 * 60 * 1000

async function addLogAt(userId, calories, createdAt) {
    await FoodLog.create({ userId, name: "test food", calories, protein: 10, carbs: 20, fat: 5, createdAt })
}

describe("GET /api/stats/weekly", () => {
    it("requires login", async () => {
        const res = await request(app).get("/api/stats/weekly")
        expect([401, 403]).toContain(res.status)
    })

    it("totals calories per day, fills empty days, and computes the summary", async () => {
        const { email, token } = await registerAndLogin("statsuser")
        const user = await User.findOne({ email })
        const now = Date.now()

        await addLogAt(user._id, 100, new Date(now))
        await addLogAt(user._id, 200, new Date(now))
        await addLogAt(user._id, 500, new Date(now - 2 * DAY_MS))

        const res = await request(app)
            .get("/api/stats/weekly?tz=UTC")
            .set("Authorization", `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body.daily).toHaveLength(7)
        expect(res.body.daily[6].calories).toBe(300)
        expect(res.body.daily[4].calories).toBe(500)
        expect(res.body.daily[5].calories).toBe(0)
        expect(res.body.summary.daysTracked).toBe(2)
        expect(res.body.summary.avgCalories).toBe(400)
        expect(res.body.summary.bestDay).toBe(res.body.daily[4].date)
    })

    it("groups by the user's timezone, not the server's", async () => {
        const { email, token } = await registerAndLogin("tzuser")
        const user = await User.findOne({ email })

        // 02:00 UTC today = the evening of the previous day in Chicago
        const n = new Date()
        const instant = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 2, 0, 0))
        await addLogAt(user._id, 700, instant)

        const utc = await request(app).get("/api/stats/weekly?tz=UTC").set("Authorization", `Bearer ${token}`)
        const chi = await request(app).get("/api/stats/weekly?tz=America/Chicago").set("Authorization", `Bearer ${token}`)

        const utcDay = utc.body.daily.find(d => d.calories === 700).date
        const chiDay = chi.body.daily.find(d => d.calories === 700).date

        expect(utcDay).toBe(instant.toISOString().slice(0, 10))
        expect(new Date(utcDay) - new Date(chiDay)).toBe(DAY_MS) // Chicago puts it on the previous day
    })

    it("only counts the logged-in user's logs", async () => {
        const a = await registerAndLogin("usera")
        const b = await registerAndLogin("userb")
        const userA = await User.findOne({ email: a.email })
        await addLogAt(userA._id, 999, new Date())

        const res = await request(app).get("/api/stats/weekly?tz=UTC").set("Authorization", `Bearer ${b.token}`)
        expect(res.body.summary.daysTracked).toBe(0)
    })
})