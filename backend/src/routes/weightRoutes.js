import express from "express"
import { logWeight, getWeightHistory, setGoalWeight, getGoalWeight } from "../controllers/weightController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/weight", authenticateToken, logWeight)
router.get("/weight/history", authenticateToken, getWeightHistory)
router.post("/weight/goal", authenticateToken, setGoalWeight)
router.get("/weight/goal", authenticateToken, getGoalWeight)

export default router