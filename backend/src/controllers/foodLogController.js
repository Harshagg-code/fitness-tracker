import FoodLog from "../models/foodLogModel.js"

export async function addLog(req, res) {
    try {
        const { name, calories, protein, carbs, fat, mealType } = req.body
        const log = new FoodLog({
            userId: req.user.id,
            name, calories, protein, carbs, fat,
            mealType: mealType || "breakfast"
        })
        await log.save()
        res.status(201).json(log)
    } catch (error) {
        console.log("Error in addLog controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function getLogs(req, res) {
    try {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const logs = await FoodLog.find({
            userId: req.user.id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        })

        const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0)

        // Group by meal type
        const grouped = {
            breakfast: logs.filter(l => l.mealType === "breakfast"),
            lunch: logs.filter(l => l.mealType === "lunch"),
            snacks: logs.filter(l => l.mealType === "snacks"),
            dinner: logs.filter(l => l.mealType === "dinner"),
        }

        res.json({ logs, grouped, totalCalories })
    } catch (error) {
        console.log("Error in getLogs controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function deleteLog(req, res) {
    try {
        await FoodLog.findByIdAndDelete(req.params.id)
        res.json({ message: "Log deleted" })
    } catch (error) {
        console.log("Error in deleteLog controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function getWeeklyLogs(req, res) {
    try {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        const logs = await FoodLog.find({
            userId: req.user.id,
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: 1 })

        // Group by date
        const grouped = {}
        logs.forEach(log => {
            const date = log.createdAt.toISOString().split("T")[0]
            if (!grouped[date]) grouped[date] = { logs: [], totalCalories: 0 }
            grouped[date].logs.push(log)
            grouped[date].totalCalories += log.calories
        })

        res.json(grouped)
    } catch (error) {
        console.error("Error in getWeeklyLogs", error)
        res.status(500).json({ message: "Internal server error" })
    }
}