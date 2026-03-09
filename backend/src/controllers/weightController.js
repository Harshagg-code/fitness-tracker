import Weight from "../models/weightModel.js"
import User from "../models/userModel.js"

const getToday = () => new Date().toISOString().split("T")[0]

export async function logWeight(req, res) {
    try {
        const { weight } = req.body
        const log = await Weight.findOneAndUpdate(
            { userId: req.user.id, date: getToday() },
            { weight },
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
        const logs = await Weight.find({ userId: req.user.id })
            .sort({ date: 1 })
            .limit(30)
        res.json(logs)
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