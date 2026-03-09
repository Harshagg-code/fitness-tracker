import express from "express"
import { getWater, updateWater } from "../controllers/waterController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/water", authenticateToken, getWater)
router.post("/water", authenticateToken, updateWater)

export default router