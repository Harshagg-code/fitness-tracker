import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from "recharts"
import ReactMarkdown from "react-markdown"
import { Leaf, ArrowLeft, Bot } from "lucide-react"

const WeeklyPage = () => {
    const [weeklyLogs, setWeeklyLogs] = useState({})
    const [weightHistory, setWeightHistory] = useState([])
    const [calorieGoal, setCalorieGoal] = useState(null)
    const [waterHistory, setWaterHistory] = useState([])
    const [aiReport, setAiReport] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)
    const { accessToken, logout, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetchWeeklyData()
    }, [])

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const fetchWeeklyData = async () => {
        try {
            const [weekRes, weightRes, profileRes] = await Promise.all([
                axios.get("http://localhost:5001/api/logs/week", getAuthHeaders()),
                axios.get("http://localhost:5001/api/weight/history", getAuthHeaders()),
                axios.get("http://localhost:5001/api/profile", getAuthHeaders()),
            ])
            setWeeklyLogs(weekRes.data)
            setWeightHistory(weightRes.data.dailyLogs || [])  // 👈 fallback to []
            setCalorieGoal(profileRes.data.calorieGoal)
        } catch (error) {
            console.error("Error fetching weekly data", error)
        }
    }

    // Build last 7 days array
    const getLast7Days = () => {
        const days = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split("T")[0]
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
            const calories = weeklyLogs[dateStr]?.totalCalories || 0
            days.push({ date: dateStr, day: dayName, calories })
        }
        return days
    }

    const getWeightChartData = () => {
        return weightHistory.slice(-7).map(log => ({
            date: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
            weight: log.weight
        }))
    }

    const chartData = getLast7Days()

    // Weekly stats
    const daysWithData = chartData.filter(d => d.calories > 0)
    const avgCalories = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((sum, d) => sum + d.calories, 0) / daysWithData.length)
        : 0
    const bestDay = daysWithData.length > 0
        ? daysWithData.reduce((best, d) => d.calories > best.calories ? d : best, daysWithData[0])
        : null
    const goalMetDays = calorieGoal
        ? daysWithData.filter(d => d.calories <= calorieGoal).length
        : 0

    const getAIReport = async () => {
        setAiLoading(true)
        try {
            const summary = `
                Weekly summary for ${user}:
                - Calorie goal: ${calorieGoal} kcal/day
                - Days tracked: ${daysWithData.length}/7
                - Average calories: ${avgCalories} kcal
                - Days goal was met: ${goalMetDays}
                - Daily breakdown: ${chartData.map(d => `${d.day}: ${d.calories} kcal`).join(", ")}
                - Weight history: ${weightHistory.slice(-7).map(w => `${w.date}: ${w.weight}kg`).join(", ")}
            `
            const res = await axios.post(
                "http://localhost:5001/api/ai/advice",
                { messages: [{ role: "user", content: `Please give me a detailed weekly nutrition and fitness report based on this data: ${summary}` }] },
                getAuthHeaders()
            )
            setAiReport(res.data.reply)
        } catch (error) {
            toast.error("Failed to get AI report")
        } finally {
            setAiLoading(false)
        }
    }

    const CustomBar = (props) => {
        const { x, y, width, height, calories } = props
        const color = calorieGoal
            ? calories > calorieGoal ? "#ef4444" : calories > 0 ? "#22c55e" : "#e5e7eb"
            : "#C4A882"
        return <rect x={x} y={y} width={width} height={height} fill={color} rx={4} />
    }

    return (
        <div className="min-h-screen bg-base-200">

            {/* Navbar */}
            <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-6">
                <div className="navbar-start">
                    <Leaf className="w-6 h-6 text-primary mr-2" />
                    <span className="text-xl font-bold text-primary">Fitness Tracker</span>
                </div>
                <div className="navbar-end gap-3">
                    <button onClick={() => navigate("/")} className="btn btn-ghost btn-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Home
                    </button>
                    <button onClick={logout} className="btn btn-error btn-sm btn-outline">Logout</button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">

                <h1 className="text-2xl font-bold">Weekly Overview</h1>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Days Tracked", value: `${daysWithData.length} / 7`, color: "text-primary" },
                        { label: "Avg Calories", value: `${avgCalories} kcal`, color: "text-warning" },
                        { label: "Goal Met", value: `${goalMetDays} days`, color: "text-success" },
                        { label: "Best Day", value: bestDay ? `${bestDay.day} (${bestDay.calories} kcal)` : "—", color: "text-primary" },
                    ].map((stat) => (
                        <div key={stat.label} className="card bg-base-100 shadow-sm">
                            <div className="card-body py-4 px-5">
                                <p className="text-xs uppercase tracking-widest text-base-content/50">{stat.label}</p>
                                <p className={`text-lg font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Two column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Calorie Bar Chart */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold mb-4">
                                Calories This Week
                            </h2>
                            {daysWithData.length === 0 ? (
                                <p className="text-base-content/40 text-sm">No data logged this week yet</p>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={chartData} barSize={32}>
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <YAxis hide />
                                            <Tooltip
                                                formatter={(value) => [`${value} kcal`, "Calories"]}
                                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                                            />
                                            {calorieGoal && <ReferenceLine y={calorieGoal} stroke="#C4A882" strokeDasharray="4 4" />}
                                            <Bar dataKey="calories" shape={<CustomBar />} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex gap-4 mt-2">
                                        <span className="flex items-center gap-1 text-xs text-base-content/50">
                                            <span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span> Under goal
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-base-content/50">
                                            <span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> Over goal
                                        </span>
                                        {calorieGoal && (
                                            <span className="flex items-center gap-1 text-xs text-base-content/50">
                                                <span className="w-6 border-t-2 border-dashed border-[#C4A882] inline-block"></span> Goal
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Weight Line Chart */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold mb-4">
                                Weight Trend
                            </h2>
                            {weightHistory.length < 2 ? (
                                <p className="text-base-content/40 text-sm">Log your weight for at least 2 days to see a trend</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={getWeightChartData()}>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <YAxis
                                            domain={["auto", "auto"]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => `${v}kg`}
                                        />
                                        <Tooltip formatter={(value) => [`${value}kg`, "Weight"]} contentStyle={{ borderRadius: "8px", border: "none" }} />
                                        <Line
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#D94F1E"
                                            strokeWidth={2}
                                            dot={{ fill: "#D94F1E", r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Daily Breakdown */}
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                        <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold mb-4">Daily Breakdown</h2>
                        <div className="flex flex-col gap-2">
                            {chartData.map((day) => (
                                <div key={day.date} className="flex items-center gap-4">
                                    <p className="text-sm font-semibold w-10">{day.day}</p>
                                    <div className="flex-1 bg-base-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: calorieGoal ? `${Math.min((day.calories / calorieGoal) * 100, 100)}%` : "0%",
                                                backgroundColor: day.calories > calorieGoal ? "#ef4444" : "#22c55e"
                                            }}
                                        />
                                    </div>
                                    <p className="text-sm text-base-content/50 w-24 text-right">
                                        {day.calories > 0 ? `${day.calories} kcal` : "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Weekly Report */}
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold">AI Weekly Report</h2>
                                <p className="text-xs text-base-content/40 mt-1">Get personalized feedback on your week</p>
                            </div>
                            <button
                                onClick={getAIReport}
                                className={`btn btn-primary btn-sm ${aiLoading ? "loading" : ""}`}
                                disabled={aiLoading || daysWithData.length === 0}
                            >
                                {!aiLoading && <Bot className="w-4 h-4 mr-1" />}
                                {aiLoading ? "Analyzing..." : "Generate Report"}
                            </button>
                        </div>
                        {aiReport && (
                            <div className="mt-4 p-4 bg-base-200 rounded-xl text-sm leading-relaxed">
                                <ReactMarkdown>{aiReport}</ReactMarkdown>
                            </div>
                        )}
                        {!aiReport && !aiLoading && daysWithData.length === 0 && (
                            <p className="text-xs text-base-content/30 mt-3">Log some food this week to generate a report</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default WeeklyPage