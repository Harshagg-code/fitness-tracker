import express from "express"
import { getNutrition } from "../controllers/foodController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.get("/", getAllNotes);
// router.get("/:id", getNoteById);
// router.post("/", createNote);
// router.put("/:id", updateNote); 
// router.delete("/:id", deleteNote);


router.post("/nutrition", authenticateToken, getNutrition);


export default router;


