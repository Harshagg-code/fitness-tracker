import WaterLog from "../models/waterLogModel.js"

const getToday = () => new Date().toISOString().split("T")[0]

export async function getWater(req, res) {
    try {
        const log = await WaterLog.findOne({ userId: req.user.id, date: getToday() })
        res.json({ glasses: log?.glasses || 0 })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function updateWater(req, res) {
    try {
        const { glasses } = req.body
        const log = await WaterLog.findOneAndUpdate(
            { userId: req.user.id, date: getToday() },
            { glasses },
            { upsert: true, new: true }
        )
        res.json({ glasses: log.glasses })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}