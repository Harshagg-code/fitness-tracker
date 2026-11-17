import request from "supertest"
import app from "../../src/app.js"

export async function registerAndLogin(username) {
    const email = `${username}@test.com`
    const password = "Password123!"

    await request(app).post("/api/auth/register").send({ username, email, password })
    const res = await request(app).post("/api/auth/login").send({ email, password })

    return { username, email, password, token: res.body.accessToken }
}