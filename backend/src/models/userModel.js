import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    age: { type: Number },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    gender: { type: String, enum: ["male", "female"] },
    activityLevel: { type: String, enum: ["sedentary", "light", "moderate", "active", "very_active"] },
    calorieGoal: { type: Number },
    goalWeight: { type: Number, default: null },
}, { timestamps: true })

const User = mongoose.model("User", userSchema)
export default User