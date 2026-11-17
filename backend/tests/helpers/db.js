import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

let mongo

export async function connectTestDB() {
    mongo = await MongoMemoryServer.create()
    await mongoose.connect(mongo.getUri())
}

export async function clearTestDB() {
    const collections = mongoose.connection.collections
    for (const name in collections) {
        await collections[name].deleteMany({})
    }
}

export async function closeTestDB() {
    await mongoose.disconnect()
    await mongo.stop()
}