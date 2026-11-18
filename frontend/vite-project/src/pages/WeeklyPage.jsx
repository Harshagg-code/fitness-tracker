import { useState, useEffect } from "react"
import api from "../api"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from "recharts"
import ReactMarkdown from "react-markdown"
import { Bot, CalendarCheck, Flame, Target, Trophy } from "lucide-react"
import Card from "../components/Card"
import StatTile from "../components/StatTile"

const WeeklyPage = () => {
    const [stats, setStats] = useState(null)
    const [weightHistory, setWeightHistory] = useState([])
    const [aiReport, setAiReport] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        fetchWeeklyData()
    }, [])

    const fetchWeeklyData = async () => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            const [statsRes, weightRes] = await Promise.all([
                api.get("/api/stats/weekly", { params: { tz } }),
                api.get("/api/weight/history"),
            ])
            setStats(statsRes.data)
            setWeightHistory(weightRes.data.dailyLogs || [])
        } catch (error) {
            console.error("Error fetching weekly data", error)
        }
    }

    // Build last 7 days array


    const getWeightChartData = () => {
        return weightHistory.slice(-7).map(log => ({
            date: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
            weight: log.weight
        }))
    }

    const calorieGoal = stats?.calorieGoal ?? null

    const chartData = (stats?.daily ?? []).map(d => ({
        ...d,
        day: new Date(`${d.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" })
    }))

    const daysWithData = chartData.filter(d => d.calories > 0)
    const avgCalories = stats?.summary.avgCalories ?? 0
    const bestDay = stats?.summary.bestDay
        ? chartData.find(d => d.date === stats.summary.bestDay)
        : null
    const goalMetDays = stats?.summary.goalMetDays ?? 0

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
            const res = await api.post(
                "/api/ai/advice",
                { messages: [{ role: "user", content: `Please give me a detailed weekly nutrition and fitness report based on this data: ${summary}` }] }
            )
            setAiReport(res.data.reply)
        } catch {
            toast.error("Failed to get AI report")
        } finally {
            setAiLoading(false)
        }
    }

    const todayStr = chartData[chartData.length - 1]?.date

    const CustomBar = (props) => {
        const { x, y, width, height, calories, date } = props
        const isToday = date === todayStr
        const color = isToday
            ? (calorieGoal && calories > calorieGoal ? "#FF4B3E" : "#D4F04A")
            : "rgba(255,255,255,0.22)"
        return <rect x={x} y={y} width={width} height={height} fill={color} rx={6} />
    }

    return (
        <div className="min-h-screen bg-base-200 pb-10">

            <Navbar />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-4">

                <div>
                    <h1 className="text-2xl font-bold">Weekly overview</h1>
                    <p className="text-sm text-base-content/60 mt-1">Your last 7 days of calories and weight</p>
                </div>

                {/* Summary tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatTile icon={CalendarCheck} label="Days tracked" value={daysWithData.length} unit="/ 7" sub="Days with food logged" />
                    <StatTile icon={Flame} label="Avg calories" value={avgCalories} unit="kcal" sub="Per tracked day" />
                    <StatTile icon={Target} label="Goal met" value={goalMetDays} unit="days" sub={calorieGoal ? `At or under ${calorieGoal} kcal` : "Set a calorie goal in Profile"} />
                    <StatTile
                        icon={Trophy}
                        label="Best day"
                        value={bestDay ? bestDay.day : "-"}
                        sub={bestDay ? `${bestDay.calories} kcal` : "No data yet"}
                    />
                </div>

                {/* Chart (dark) + weight */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <section className="lg:col-span-7 card bg-neutral text-neutral-content rounded-box p-5">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h2 className="text-base font-semibold">Calories this week</h2>
                            <div className="flex items-center gap-3 text-xs text-neutral-content/60">
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary inline-block"></span> Today</span>
                                {calorieGoal && (
                                    <span className="flex items-center gap-1"><span className="w-5 border-t-2 border-dashed border-primary inline-block"></span> Goal</span>
                                )}
                            </div>
                        </div>
                        {daysWithData.length === 0 ? (
                            <p className="text-sm text-neutral-content/60">No data logged this week yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={chartData} barSize={32}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A3A3A3" }} />
                                    <YAxis hide domain={[0, (max) => Math.max(max, calorieGoal || 0)]} />
                                    <Tooltip
                                        cursor={false}
                                        formatter={(value) => [`${value} kcal`, "Calories"]}
                                        contentStyle={{ borderRadius: "12px", border: "none", color: "#111111" }}
                                    />
                                    {calorieGoal && <ReferenceLine y={calorieGoal} stroke="#D4F04A" strokeDasharray="4 4" />}
                                    <Bar dataKey="calories" shape={<CustomBar />} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </section>

                    <div className="lg:col-span-5">
                        <Card title="Weight trend">
                            {weightHistory.length < 2 ? (
                                <p className="text-sm text-base-content/60">Log your weight for at least 2 days to see a trend</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={getWeightChartData()}>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B6B6B" }} />
                                        <YAxis
                                            domain={["auto", "auto"]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: "#6B6B6B" }}
                                            tickFormatter={(v) => `${v}kg`}
                                        />
                                        <Tooltip formatter={(value) => [`${value}kg`, "Weight"]} contentStyle={{ borderRadius: "12px", border: "none" }} />
                                        <Line
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#111111"
                                            strokeWidth={2}
                                            dot={{ fill: "#D4F04A", stroke: "#111111", strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Breakdown + AI report */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-5">
                        <Card title="Daily breakdown">
                            <div className="flex flex-col gap-3">
                                {chartData.map((day) => (
                                    <div key={day.date} className="flex items-center gap-3">
                                        <p className="text-sm font-medium w-9">{day.day}</p>
                                        <progress
                                            className={`progress flex-1 ${calorieGoal && day.calories > calorieGoal ? "progress-error" : "progress-neutral"}`}
                                            value={calorieGoal ? Math.min((day.calories / calorieGoal) * 100, 100) : 0}
                                            max="100"
                                        />
                                        <p className="text-sm text-base-content/60 w-20 text-right">
                                            {day.calories > 0 ? `${day.calories} kcal` : "-"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-7">
                        <Card
                            title="AI weekly report"
                            action={
                                <button
                                    onClick={getAIReport}
                                    className="btn btn-primary btn-sm rounded-full"
                                    disabled={aiLoading || daysWithData.length === 0}
                                >
                                    {aiLoading ? <span className="loading loading-spinner loading-xs" /> : <Bot className="w-4 h-4" />}
                                    {aiLoading ? "Analyzing" : "Generate report"}
                                </button>
                            }
                        >
                            {aiReport ? (
                                <div className="bg-base-200 rounded-field p-4 text-sm leading-relaxed">
                                    <ReactMarkdown>{aiReport}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm text-base-content/60">
                                    {daysWithData.length === 0
                                        ? "Log some food this week to generate a report"
                                        : "Get personalized feedback on your week"}
                                </p>
                            )}
                        </Card>
                    </div>
                </div>

            </main>
        </div>
    )
}

export default WeeklyPage
