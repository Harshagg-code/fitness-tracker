import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

// REGISTER
export async function register(req, res) {
    const { username, email, password } = req.body
    try {
        if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" })
        if (await User.findOne({ username })) return res.status(409).json({ message: "Username already taken" })

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({ username, email, password: hashedPassword })
        await user.save()

        res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        // Unique index hit by a concurrent request
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0]
            return res.status(409).json({ message: field === "username" ? "Username already taken" : "Email already registered" })
        }
        console.log("Error in register controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

// LOGIN
export async function login(req, res) {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: "Invalid credentials" })

        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).json({ message: "Invalid credentials" })

        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )
        const refreshToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.REFRESH_TOKEN_SECRET
        )

        user.refreshToken = refreshToken
        await user.save()

        res.json({ accessToken, refreshToken, username: user.username })
    } catch (error) {
        console.log("Error in login controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

// REFRESH TOKEN
export async function refresh(req, res) {
    const { token } = req.body
    if (!token) return res.sendStatus(401)

    const user = await User.findOne({ refreshToken: token })
    if (!user) return res.sendStatus(403)

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, userData) => {
        if (err) return res.sendStatus(403)
        const accessToken = jwt.sign(
            { id: userData.id, username: userData.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )
        res.json({ accessToken })
    })
}

// LOGOUT
export async function logout(req, res) {
    const { token } = req.body
    await User.updateOne({ refreshToken: token }, { refreshToken: null })
    res.sendStatus(204)
}