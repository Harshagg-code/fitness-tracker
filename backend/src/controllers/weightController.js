import Weight from "../models/weightModel.js"
import User from "../models/userModel.js"

const getToday = () => new Date().toISOString().split("T")[0]

export async function logWeight(req, res) {
    try {
        const { weight } = req.body
        const log = await Weight.findOneAndUpdate(
            { userId: req.user.id, date: getToday(), type: "daily" },
            { weight, type: "daily" },
            { upsert: true, new: true }
        )
        res.json(log)
    } catch (error) {
        console.error("Error in logWeight", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function getWeightHistory(req, res) {
    try {
        const startingWeight = await Weight.findOne({ userId: req.user.id, type: "start" })
        const dailyLogs = await Weight.find({ userId: req.user.id, type: "daily" })
            .sort({ date: 1 })
            .limit(30)
        res.json({ startingWeight, dailyLogs })
    } catch (error) {
        console.error("Error in getWeightHistory", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function setGoalWeight(req, res) {
    try {
        const { goalWeight } = req.body
        await User.findByIdAndUpdate(req.user.id, { goalWeight })
        res.json({ goalWeight })
    } catch (error) {
        console.error("Error in setGoalWeight", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function getGoalWeight(req, res) {
    try {
        const user = await User.findById(req.user.id)
        res.json({ goalWeight: user.goalWeight || null })
    } catch (error) {
        console.error("Error in getGoalWeight", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function resetWeightHistory(req, res) {
    try {
        await Weight.deleteMany({ userId: req.user.id })
        res.json({ message: "Weight history cleared" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function setStartingWeight(req, res) {
    try {
        const { weight } = req.body
        // Only set if no history exists
        const existing = await Weight.findOne({ userId: req.user.id, type: "start" })
        if (existing) return res.status(400).json({ message: "Starting weight already set" })

        const log = new Weight({ userId: req.user.id, weight, date: "start", type: "start" })
        await log.save()
        res.json(log)
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}