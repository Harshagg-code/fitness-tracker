import express from "express"
import { getWeeklyStats } from "../controllers/statsController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/stats/weekly", authenticateToken, getWeeklyStats)

export default router