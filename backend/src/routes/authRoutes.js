import express from "express"
import { register, login, refresh, logout } from "../controllers/authController.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/token", refresh)
router.delete("/logout", logout)

export default router