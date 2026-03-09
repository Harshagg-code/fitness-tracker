import express from "express"
import { addLog, getLogs, deleteLog, getWeeklyLogs } from "../controllers/foodLogController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/logs", authenticateToken, addLog)
router.get("/logs", authenticateToken, getLogs)
router.delete("/logs/:id", authenticateToken, deleteLog)
router.get("/logs/week", authenticateToken, getWeeklyLogs)

export default router