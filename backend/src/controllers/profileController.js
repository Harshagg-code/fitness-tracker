import User from "../models/userModel.js"

// Harris-Benedict formula
function calculateCalories(age, height, weight, gender, activityLevel) {
    let bmr

    if (gender === "male") {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    }

    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    }

    return Math.round(bmr * activityMultipliers[activityLevel])
}

// Get user profile
export async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user.id).select("-password -refreshToken")
        res.json(user)
    } catch (error) {
        console.log("Error in getProfile controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

// Update user profile
export async function updateProfile(req, res) {
    const { age, height, weight, gender, activityLevel } = req.body
    try {
        const calorieGoal = calculateCalories(age, height, weight, gender, activityLevel)

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { age, height, weight, gender, activityLevel, calorieGoal },
            { new: true }
        ).select("-password -refreshToken")

        res.json({ user, calorieGoal })
    } catch (error) {
        console.log("Error in updateProfile controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}