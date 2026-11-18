import mongoose from "mongoose"
import FoodLog from "../models/foodLogModel.js"
import User from "../models/userModel.js"

const DAY_MS = 24 * 60 * 60 * 1000

function isValidTimezone(tz) {
    if (typeof tz !== "string") return false
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz })
        return true
    } catch {
        return false
    }
}

// Last n calendar dates (YYYY-MM-DD) as they are in the user's timezone
function lastNDates(n, tz) {
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz })
    const dates = []
    for (let i = n - 1; i >= 0; i--) {
        dates.push(fmt.format(new Date(Date.now() - i * DAY_MS)))
    }
    return dates
}

export async function getWeeklyStats(req, res) {
    try {
        const tz = isValidTimezone(req.query.tz) ? req.query.tz : "UTC"
        const dates = lastNDates(7, tz)
        const since = new Date(Date.now() - 8 * DAY_MS) // generous; the 7 dates above are the real window

        const rows = await FoodLog.aggregate([
            {
                $match: {
                    // aggregate() does NOT auto-convert strings to ObjectIds like find() does
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    createdAt: { $gte: since }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: tz } },
                    calories: { $sum: "$calories" },
                    protein: { $sum: "$protein" },
                    carbs: { $sum: "$carbs" },
                    fat: { $sum: "$fat" },
                    entries: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        // Days with no logs don't come back from the database, so fill them with zeros
        const byDate = Object.fromEntries(rows.map(r => [r._id, r]))
        const daily = dates.map(date => ({
            date,
            calories: Math.round(byDate[date]?.calories || 0),
            protein: Math.round(byDate[date]?.protein || 0),
            carbs: Math.round(byDate[date]?.carbs || 0),
            fat: Math.round(byDate[date]?.fat || 0),
            entries: byDate[date]?.entries || 0
        }))

        const user = await User.findById(req.user.id).select("calorieGoal")
        const calorieGoal = user?.calorieGoal || null

        const tracked = daily.filter(d => d.calories > 0)
        const summary = {
            daysTracked: tracked.length,
            avgCalories: tracked.length
                ? Math.round(tracked.reduce((sum, d) => sum + d.calories, 0) / tracked.length)
                : 0,
            bestDay: tracked.length
                ? tracked.reduce((best, d) => (d.calories > best.calories ? d : best)).date
                : null,
            goalMetDays: calorieGoal ? tracked.filter(d => d.calories <= calorieGoal).length : 0
        }

        res.json({ timezone: tz, calorieGoal, daily, summary })
    } catch (error) {
        console.error("Error in getWeeklyStats", error)
        res.status(500).json({ message: "Internal server error" })
    }
}