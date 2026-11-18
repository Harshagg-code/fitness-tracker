import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import FoodLog from "../src/models/foodLogModel.js"

const DAY_MS = 24 * 60 * 60 * 1000
const USERS = 100
const TOTAL = 300_000

const mongod = await MongoMemoryServer.create()
// autoIndex off so the "before" run really has no index
await mongoose.connect(mongod.getUri(), { autoIndex: false })

const userIds = Array.from({ length: USERS }, () => new mongoose.Types.ObjectId())

console.log(`Seeding ${TOTAL.toLocaleString()} logs...`)
for (let i = 0; i < TOTAL; i += 10_000) {
    const batch = Array.from({ length: 10_000 }, () => ({
        userId: userIds[Math.floor(Math.random() * USERS)],
        name: "food",
        calories: Math.round(Math.random() * 800),
        protein: 10, carbs: 20, fat: 5,
        mealType: "lunch",
        createdAt: new Date(Date.now() - Math.random() * 365 * DAY_MS)
    }))
    await FoodLog.collection.insertMany(batch)
}

async function measure(label) {
    const plan = await FoodLog.find({
        userId: userIds[0],
        createdAt: { $gte: new Date(Date.now() - 8 * DAY_MS) }
    }).explain("executionStats")

    const stats = plan.executionStats
    const usesIndex = JSON.stringify(plan.queryPlanner.winningPlan).includes("IXSCAN")
    console.log(`\n${label}`)
    console.log("  plan:               ", usesIndex ? "IXSCAN (uses index)" : "COLLSCAN (reads everything)")
    console.log("  docs examined:      ", stats.totalDocsExamined)
    console.log("  docs returned:      ", stats.nReturned)
    console.log("  time (ms):          ", stats.executionTimeMillis)
}

await measure("BEFORE index")
await FoodLog.createIndexes()
await measure("AFTER index")

await mongoose.disconnect()
await mongod.stop()