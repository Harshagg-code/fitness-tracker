import express from "express"
import { logWeight, getWeightHistory, setStartingWeight, resetWeightHistory, setGoalWeight, getGoalWeight } from "../controllers/weightController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/weight/start", authenticateToken, setStartingWeight)
router.post("/weight", authenticateToken, logWeight)
router.get("/weight/history", authenticateToken, getWeightHistory)
router.delete("/weight/reset", authenticateToken, resetWeightHistory)
router.post("/weight/goal", authenticateToken, setGoalWeight)
router.get("/weight/goal", authenticateToken, getGoalWeight)

export default router