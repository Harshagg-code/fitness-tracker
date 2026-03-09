import express from "express"
import { getNutritionAdvice } from "../controllers/aiController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/ai/advice", authenticateToken, getNutritionAdvice)

export default router