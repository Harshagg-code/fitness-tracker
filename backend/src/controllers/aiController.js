import Anthropic from "@anthropic-ai/sdk"
import User from "../models/userModel.js"
import FoodLog from "../models/foodLogModel.js"

export async function getNutritionAdvice(req, res) {
    const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    })

    try {
        const user = await User.findById(req.user.id).select("-password -refreshToken")

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const logs = await FoodLog.find({
            userId: req.user.id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        })

        const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0)
        const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0)
        const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0)
        const totalFat = logs.reduce((sum, log) => sum + log.fat, 0)
        const foodList = logs.map(log => log.name).join(", ")

        const systemPrompt = `You are a friendly and knowledgeable personal nutrition coach. Here is your client's information:

Name: ${user.username}
Age: ${user.age}
Weight: ${user.weight}kg
Height: ${user.height}cm
Gender: ${user.gender}
Activity Level: ${user.activityLevel}
Daily Calorie Goal: ${user.calorieGoal} kcal

Today's food log:
Foods eaten: ${foodList || "Nothing logged yet"}
Total Calories: ${totalCalories.toFixed(0)} kcal
Total Protein: ${totalProtein.toFixed(1)}g
Total Carbs: ${totalCarbs.toFixed(1)}g
Total Fat: ${totalFat.toFixed(1)}g

You have access to their full nutrition data for today. Be friendly, concise and practical. Use emojis occasionally. Answer any nutrition related questions they have.`

        const { messages } = req.body

        const response = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages
        })

        res.json({ reply: response.content[0].text })
    } catch (error) {
        console.log("Error in getNutritionAdvice controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}