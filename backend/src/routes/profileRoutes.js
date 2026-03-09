import express from "express"
import { getProfile, updateProfile } from "../controllers/profileController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/profile", authenticateToken, getProfile)
router.put("/profile", authenticateToken, updateProfile)

export default router