import mongoose from "mongoose"

const savedMealSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    items: [
        {
            name: { type: String },
            calories: { type: Number },
            protein: { type: Number },
            carbs: { type: Number },
            fat: { type: Number },
        }
    ],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model("SavedMeal", savedMealSchema)