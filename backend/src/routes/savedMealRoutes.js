import express from "express"
import { getSavedMeals, createSavedMeal, deleteSavedMeal } from "../controllers/savedMealController.js"
import { authenticateToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/saved-meals", authenticateToken, getSavedMeals)
router.post("/saved-meals", authenticateToken, createSavedMeal)
router.delete("/saved-meals/:id", authenticateToken, deleteSavedMeal)

export default router