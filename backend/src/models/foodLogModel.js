import mongoose from "mongoose"

const foodLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    mealType: {
        type: String,
        enum: ["breakfast", "lunch", "snacks", "dinner"],
        default: "breakfast"
    }
}, { timestamps: true })

export default mongoose.model("FoodLog", foodLogSchema)