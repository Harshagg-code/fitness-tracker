import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { Search, Bot, X, Send, Leaf } from "lucide-react"

const HomePage = () => {
    const [query, setQuery] = useState("")
    const [foods, setFoods] = useState([])
    const [logs, setLogs] = useState([])
    const [grouped, setGrouped] = useState({ breakfast: [], lunch: [], snacks: [], dinner: [] })
    const [collapsedMeals, setCollapsedMeals] = useState({ breakfast: false, lunch: false, snacks: false, dinner: false })
    const [totalCalories, setTotalCalories] = useState(0)
    const [calorieGoal, setCalorieGoal] = useState(null)
    const [loading, setLoading] = useState(false)
    const [pendingFood, setPendingFood] = useState(null)
    const [chatOpen, setChatOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [chatInput, setChatInput] = useState("")
    const [chatLoading, setChatLoading] = useState(false)
    const [glasses, setGlasses] = useState(0)
    const [weightHistory, setWeightHistory] = useState([])
    const [startingWeight, setStartingWeight] = useState(null)
    const [activeTab, setActiveTab] = useState("search")
    const [savedMeals, setSavedMeals] = useState([])
    const [pendingMeal, setPendingMeal] = useState(null)
    const [weightInput, setWeightInput] = useState("")
    const [dailyWeightInput, setDailyWeightInput] = useState("")
    const GOAL = 8
    const { accessToken, refreshAccessToken, logout, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetchLogs()
        fetchWater()
        fetchWeight()
        fetchSavedMeals()
    }, [])

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const fetchLogs = async () => {
        try {
            const [logsRes, profileRes] = await Promise.all([
                axios.get("https://fitness-tracker-y6q9.onrender.com/api/logs", getAuthHeaders()),
                axios.get("https://fitness-tracker-y6q9.onrender.com/api/profile", getAuthHeaders())
            ])
            setLogs(logsRes.data.logs)
            setGrouped(logsRes.data.grouped)
            setTotalCalories(logsRes.data.totalCalories)
            setCalorieGoal(profileRes.data.calorieGoal)
        } catch (error) {
            console.error("Error fetching data", error)
        }
    }

    const fetchWater = async () => {
        try {
            const res = await axios.get("https://fitness-tracker-y6q9.onrender.com/api/water", getAuthHeaders())
            setGlasses(res.data.glasses)
        } catch (error) {
            console.error("Error fetching water", error)
        }
    }

    const fetchWeight = async () => {
        try {
            const res = await axios.get("https://fitness-tracker-y6q9.onrender.com/api/weight/history", getAuthHeaders())
            setWeightHistory(res.data.dailyLogs || [])
            setStartingWeight(res.data.startingWeight)
        } catch (error) {
            console.error("Error fetching weight", error)
        }
    }

    const handleSearch = async () => {
        if (!query.trim()) { toast.error("Please enter a food query"); return }
        setLoading(true)
        try {
            const response = await axios.post(
                "https://fitness-tracker-y6q9.onrender.com/api/nutrition",
                { query },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            setFoods(response.data)
            toast.success("Nutrition data loaded")
        } catch (error) {
            if (error.response?.status === 403) {
                const newToken = await refreshAccessToken()
                if (newToken) {
                    const response = await axios.post(
                        "https://fitness-tracker-y6q9.onrender.com/api/nutrition",
                        { query },
                        { headers: { Authorization: `Bearer ${newToken}` } }
                    )
                    setFoods(response.data)
                    toast.success("Nutrition data loaded")
                }
            } else {
                toast.error("Failed to fetch nutrition data")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleAddToLog = async (food, mealType) => {
        try {
            await axios.post("https://fitness-tracker-y6q9.onrender.com/api/logs", { ...food, mealType }, getAuthHeaders())
            toast.success(`${food.name} added to ${mealType}`)
            setPendingFood(null)
            setFoods([])
            fetchLogs()
        } catch (error) {
            toast.error("Failed to add to log")
        }
    }

    const handleDeleteLog = async (id) => {
        try {
            await axios.delete(`https://fitness-tracker-y6q9.onrender.com/api/logs/${id}`, getAuthHeaders())
            toast.success("Removed from log")
            fetchLogs()
        } catch (error) {
            toast.error("Failed to delete log")
        }
    }

    const handleGlassClick = async (index) => {
        const newGlasses = index < glasses ? index : index + 1
        try {
            await axios.post("https://fitness-tracker-y6q9.onrender.com/api/water", { glasses: newGlasses }, getAuthHeaders())
            setGlasses(newGlasses)
        } catch (error) {
            toast.error("Failed to update water")
        }
    }

    const handleSetStartingWeight = async () => {
        if (!weightInput) return
        try {
            await axios.post("https://fitness-tracker-y6q9.onrender.com/api/weight/start", { weight: parseFloat(weightInput) }, getAuthHeaders())
            toast.success("Starting weight set!")
            setWeightInput("")
            await fetchWeight()
        } catch (error) {
            toast.error("Starting weight already set — reset history to change it")
        }
    }

    const fetchSavedMeals = async () => {
        try {
            const res = await axios.get("https://fitness-tracker-y6q9.onrender.com/api/saved-meals", getAuthHeaders())
            setSavedMeals(res.data)
        } catch (error) {
            console.error("Error fetching saved meals", error)
        }
    }

    const sendMessage = async () => {
        if (!chatInput.trim()) return
        const userMessage = { role: "user", content: chatInput }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setChatInput("")
        setChatLoading(true)
        try {
            const res = await axios.post(
                "https://fitness-tracker-y6q9.onrender.com/api/ai/advice",
                { messages: updatedMessages },
                getAuthHeaders()
            )
            setMessages([...updatedMessages, { role: "assistant", content: res.data.reply }])
        } catch (error) {
            toast.error("Failed to get response")
        } finally {
            setChatLoading(false)
        }
    }

    const percentage = calorieGoal ? Math.min((totalCalories / calorieGoal) * 100, 100) : 0
    const remaining = calorieGoal ? calorieGoal - totalCalories : 0
    const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0)
    const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0)
    const totalFat = logs.reduce((sum, log) => sum + log.fat, 0)

    const getProgressColor = () => {
        if (percentage >= 100) return "progress-error"
        if (percentage >= 75) return "progress-warning"
        return "progress-success"
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
                    <span className="text-sm text-base-content/60 hidden sm:block">
                        Hey, <span className="font-semibold text-base-content">{user}</span>
                    </span>
                    <button onClick={() => navigate("/weekly")} className="btn btn-ghost btn-sm">
                        Weekly
                    </button>
                    <button onClick={() => navigate("/profile")} className="btn btn-ghost btn-sm">
                        My Profile
                    </button>
                    <button onClick={() => navigate("/meals")} className="btn btn-ghost btn-sm">
                        My Meals
                    </button>
                    <button onClick={logout} className="btn btn-error btn-sm btn-outline">
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
                {/* Search / My Meals Tabs */}
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setActiveTab("search")}
                                className={`btn btn-sm ${activeTab === "search" ? "btn-primary" : "btn-ghost"}`}
                            >
                                <Search className="w-4 h-4 mr-1" /> Search Food
                            </button>
                            <button
                                onClick={() => setActiveTab("meals")}
                                className={`btn btn-sm ${activeTab === "meals" ? "btn-primary" : "btn-ghost"}`}
                            >
                                My Meals
                            </button>
                        </div>

                        {/* Search Tab */}
                        {activeTab === "search" && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="e.g. 2 eggs and 1 cup rice..."
                                    className="input input-bordered flex-1"
                                />
                                <button onClick={handleSearch} className={`btn btn-primary ${loading ? "loading" : ""}`}>
                                    {loading ? "" : <><Search className="w-4 h-4 mr-1" /> Search</>}
                                </button>
                            </div>
                        )}

                        {/* My Meals Tab */}
                        {activeTab === "meals" && (
                            <div className="flex flex-col gap-3">
                                {savedMeals.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-base-content/40 text-sm">No saved meals yet</p>
                                        <button onClick={() => navigate("/meals")} className="btn btn-primary btn-xs mt-2">
                                            Create a meal →
                                        </button>
                                    </div>
                                ) : (
                                    savedMeals.map((meal) => (
                                        <div key={meal._id} className="flex justify-between items-center p-3 bg-base-200 rounded-xl">
                                            <div>
                                                <p className="font-semibold text-sm">{meal.name}</p>
                                                <p className="text-xs text-base-content/50">
                                                    {meal.totalCalories.toFixed(0)} kcal · P: {meal.totalProtein.toFixed(1)}g · C: {meal.totalCarbs.toFixed(1)}g · F: {meal.totalFat.toFixed(1)}g
                                                </p>
                                            </div>
                                            {pendingMeal?._id === meal._id ? (
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs text-base-content/50">Add to:</p>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {["breakfast", "lunch", "snacks", "dinner"].map((mealType) => (
                                                            <button
                                                                key={mealType}
                                                                onClick={async () => {
                                                                    await axios.post("https://fitness-tracker-y6q9.onrender.com/api/logs", {
                                                                        name: meal.name,
                                                                        calories: meal.totalCalories,
                                                                        protein: meal.totalProtein,
                                                                        carbs: meal.totalCarbs,
                                                                        fat: meal.totalFat,
                                                                        mealType
                                                                    }, getAuthHeaders())
                                                                    toast.success(`${meal.name} added to ${mealType}!`)
                                                                    setPendingMeal(null)
                                                                    fetchLogs()
                                                                }}
                                                                className="btn btn-xs btn-outline btn-primary capitalize"
                                                            >
                                                                {mealType}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => setPendingMeal(null)} className="btn btn-xs btn-ghost">Cancel</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setPendingMeal(meal)} className="btn btn-primary btn-xs">
                                                    + Add
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                                <button onClick={() => navigate("/meals")} className="btn btn-ghost btn-xs self-end">
                                    Manage meals →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Results — only show in search tab */}
                {activeTab === "search" && foods.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold px-1">Results</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {foods.map((food, index) => (
                                <div key={index} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="card-body py-4">
                                        <p className="font-semibold capitalize">{food.name}</p>
                                        <p className="text-primary font-bold text-lg">{food.calories} kcal</p>
                                        <p className="text-xs text-base-content/50">
                                            P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
                                        </p>
                                        {pendingFood?.name === food.name ? (
                                            <div className="mt-2 flex flex-col gap-2">
                                                <p className="text-xs text-base-content/50 font-medium uppercase tracking-widest">Add to:</p>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {["breakfast", "lunch", "snacks", "dinner"].map((meal) => (
                                                        <button
                                                            key={meal}
                                                            onClick={() => handleAddToLog(food, meal)}
                                                            className="btn btn-xs btn-outline btn-primary capitalize"
                                                        >
                                                            {meal}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button onClick={() => setPendingFood(null)} className="btn btn-xs btn-ghost">
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setPendingFood(food)}
                                                className="btn btn-primary btn-sm btn-outline mt-2"
                                            >
                                                + Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* LEFT — Today's Log */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold">Today's Log</h2>
                            <div className="badge badge-primary badge-outline font-semibold">
                                {totalCalories.toFixed(0)} kcal
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {[
                                { key: "breakfast", label: "Breakfast", time: "08.00AM - 11.00AM" },
                                { key: "lunch", label: "Lunch", time: "12.00PM - 03.00PM" },
                                { key: "snacks", label: "Snacks", time: "Anytime" },
                                { key: "dinner", label: "Dinner", time: "6.30PM - 10.00PM" },
                            ].map(({ key, label, time }) => {
                                const mealLogs = grouped[key] || []
                                const mealCalories = mealLogs.reduce((sum, l) => sum + l.calories, 0)
                                const isCollapsed = collapsedMeals[key]
                                return (
                                    <div key={key} className="card bg-base-100 shadow-sm">
                                        <div className="card-body py-3 px-5">
                                            <div
                                                className="flex justify-between items-center cursor-pointer"
                                                onClick={() => setCollapsedMeals(prev => ({ ...prev, [key]: !prev[key] }))}
                                            >
                                                <div>
                                                    <p className="font-semibold">{label}</p>
                                                    <p className="text-xs text-base-content/40">{time}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {mealCalories > 0 && (
                                                        <span className="text-sm font-semibold text-primary">
                                                            {mealCalories.toFixed(0)} kcal
                                                        </span>
                                                    )}
                                                    <span className="text-base-content/40 text-xs">
                                                        {isCollapsed ? "▼" : "▲"}
                                                    </span>
                                                </div>
                                            </div>
                                            {!isCollapsed && (
                                                <>
                                                    {mealLogs.length > 0 && (
                                                        <div className="flex flex-col gap-2 mt-2">
                                                            {mealLogs.map((log) => (
                                                                <div key={log._id} className="flex justify-between items-center py-2 border-t border-base-200">
                                                                    <div>
                                                                        <p className="text-sm font-medium capitalize">{log.name}</p>
                                                                        <p className="text-xs text-base-content/40">
                                                                            {log.calories} kcal · P: {log.protein}g · C: {log.carbs}g · F: {log.fat}g
                                                                        </p>
                                                                    </div>
                                                                    <button onClick={() => handleDeleteLog(log._id)} className="btn btn-ghost btn-xs text-error">
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {mealLogs.length === 0 && (
                                                        <p className="text-xs text-base-content/30 mt-2">No foods logged yet</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* RIGHT — Calorie Progress + Charts + Water + Weight */}
                    <div className="flex flex-col gap-4">

                        {/* Daily Calories */}
                        <div className="card bg-base-100 shadow-sm">
                            <div className="card-body">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold">Daily Calories</h2>
                                    {calorieGoal ? (
                                        <span className="text-sm text-base-content/50">{totalCalories.toFixed(0)} / {calorieGoal} kcal</span>
                                    ) : (
                                        <span onClick={() => navigate("/profile")} className="text-sm text-primary cursor-pointer font-medium">
                                            Set up profile →
                                        </span>
                                    )}
                                </div>
                                {calorieGoal ? (
                                    <>
                                        <progress className={`progress w-full mt-3 ${getProgressColor()}`} value={percentage} max="100" />
                                        <div className="flex justify-between mt-1">
                                            <span className={`text-sm ${remaining < 0 ? "text-error font-semibold" : "text-base-content/50"}`}>
                                                {remaining < 0
                                                    ? `${Math.abs(remaining).toFixed(0)} kcal over goal`
                                                    : `${remaining.toFixed(0)} kcal remaining`}
                                            </span>
                                            <span className="text-sm text-base-content/50">{percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                            {[
                                                { label: "Protein", value: totalProtein, color: "text-success" },
                                                { label: "Carbs", value: totalCarbs, color: "text-warning" },
                                                { label: "Fat", value: totalFat, color: "text-error" },
                                            ].map((item) => (
                                                <div key={item.label} className="bg-base-200 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-base-content/50 mb-1">{item.label}</p>
                                                    <p className={`font-bold ${item.color}`}>{item.value.toFixed(1)}g</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-base-content/40 mt-2">Set up your profile to track your calorie goal</p>
                                )}
                            </div>
                        </div>

                        {/* Nutrition Rings */}
                        {logs.length > 0 && calorieGoal && (
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold">Nutrition Breakdown</h2>
                                    <div className="flex justify-around items-center mt-4">
                                        {[
                                            { label: "Protein", value: totalProtein, recommended: Math.round((calorieGoal * 0.30) / 4), color: "#D94F1E" },
                                            { label: "Carbs", value: totalCarbs, recommended: Math.round((calorieGoal * 0.45) / 4), color: "#C4A882" },
                                            { label: "Fat", value: totalFat, recommended: Math.round((calorieGoal * 0.25) / 9), color: "#2C2825" },
                                        ].map((macro) => {
                                            const pct = Math.round((macro.value / macro.recommended) * 100)
                                            const displayPct = Math.min(pct, 100)
                                            const radius = 40
                                            const circumference = 2 * Math.PI * radius
                                            const filled = (displayPct / 100) * circumference
                                            const empty = circumference - filled
                                            return (
                                                <div key={macro.label} className="flex flex-col items-center gap-2">
                                                    <div style={{ position: "relative", width: 100, height: 100 }}>
                                                        <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                                                            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-base-200" />
                                                            <circle
                                                                cx="50" cy="50" r={radius}
                                                                fill="none"
                                                                stroke={macro.color}
                                                                strokeWidth="10"
                                                                strokeDasharray={`${filled} ${empty}`}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <div style={{
                                                            position: "absolute", top: 0, left: 0,
                                                            width: "100%", height: "100%",
                                                            display: "flex", alignItems: "center", justifyContent: "center"
                                                        }}>
                                                            <span className="text-sm font-bold" style={{ color: pct > 100 ? "#ef4444" : "inherit" }}>
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-semibold">{macro.label}</p>
                                                    <p className="text-xs text-base-content/40">{macro.value.toFixed(1)}g / {macro.recommended}g</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Water Tracker */}
                        <div className="card bg-base-100 shadow-sm">
                            <div className="card-body py-4 px-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold">Water Intake</h2>
                                        <p className="text-2xl font-bold text-blue-500 mt-1">{glasses * 250}ml</p>
                                        <p className="text-xs text-base-content/40 mt-1">
                                            {glasses >= GOAL ? "🎉 Goal reached!" : `${(GOAL - glasses) * 250}ml remaining`}
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => glasses < GOAL && handleGlassClick(glasses)}
                                                disabled={glasses >= GOAL}
                                                className="btn btn-sm btn-outline"
                                                style={{ borderColor: "#3b82f6", color: "#3b82f6" }}
                                            >
                                                + Glass
                                            </button>
                                            {glasses > 0 && (
                                                <button
                                                    onClick={() => handleGlassClick(glasses - 2)}
                                                    className="btn btn-sm btn-ghost text-error"
                                                >
                                                    −
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ position: "relative", width: 90, height: 90 }}>
                                        <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                                            <circle cx="45" cy="45" r="36" fill="none" stroke="currentColor" strokeWidth="10" className="text-base-200" />
                                            <circle
                                                cx="45" cy="45" r="36"
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="10"
                                                strokeDasharray={`${(glasses / GOAL) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div style={{
                                            position: "absolute", top: 0, left: 0,
                                            width: "100%", height: "100%",
                                            display: "flex", flexDirection: "column",
                                            alignItems: "center", justifyContent: "center"
                                        }}>
                                            <span className="text-base font-bold">{glasses}</span>
                                            <span className="text-xs text-base-content/40">/ {GOAL}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weight Tracker */}
                        <div className="card bg-base-100 shadow-sm">
                            <div className="card-body py-4 px-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold">Weight Tracker</h2>
                                    <span
                                        className="text-xs text-error/40 cursor-pointer hover:text-error"
                                        onClick={async () => {
                                            await axios.delete("https://fitness-tracker-y6q9.onrender.com/api/weight/reset", getAuthHeaders())
                                            setWeightHistory([])
                                            setStartingWeight(null)
                                            toast.success("Weight history cleared")
                                        }}
                                    >
                                        Reset
                                    </span>
                                </div>

                                {/* Stats row */}
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    {/* Starting */}
                                    <div className="text-center flex-1">
                                        <p className="text-xs text-base-content/40 uppercase tracking-widest mb-1">Starting</p>
                                        {startingWeight ? (
                                            <p className="text-2xl font-bold">{startingWeight.weight}kg</p>
                                        ) : (
                                            <p className="text-sm text-base-content/30">Not set</p>
                                        )}
                                    </div>

                                    {/* Diff */}
                                    <div className="text-center flex-1">
                                        {startingWeight && weightHistory.length > 0 ? (
                                            <>
                                                <p className={`text-lg font-bold ${weightHistory[weightHistory.length - 1].weight < startingWeight.weight
                                                    ? "text-success" : "text-error"
                                                    }`}>
                                                    {weightHistory[weightHistory.length - 1].weight < startingWeight.weight ? "↓" : "↑"}
                                                    {Math.abs(weightHistory[weightHistory.length - 1].weight - startingWeight.weight).toFixed(1)}kg
                                                </p>
                                                <p className="text-xs text-base-content/40">
                                                    {weightHistory[weightHistory.length - 1].weight < startingWeight.weight ? "lost" : "gained"}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-base-content/20">→</p>
                                        )}
                                    </div>

                                    {/* Current */}
                                    <div className="text-center flex-1">
                                        <p className="text-xs text-base-content/40 uppercase tracking-widest mb-1">Current</p>
                                        {weightHistory.length > 0 ? (
                                            <p className="text-2xl font-bold text-primary">{weightHistory[weightHistory.length - 1].weight}kg</p>
                                        ) : (
                                            <p className="text-sm text-base-content/30">Not logged</p>
                                        )}
                                    </div>
                                </div>

                                {/* Input row */}
                                {!startingWeight ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={weightInput}
                                            onChange={(e) => setWeightInput(e.target.value)}
                                            placeholder="Starting weight (kg)"
                                            className="input input-bordered input-sm flex-1"
                                        />
                                        <button onClick={handleSetStartingWeight} className="btn btn-primary btn-sm">
                                            Set
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={dailyWeightInput}
                                            onChange={(e) => setDailyWeightInput(e.target.value)}
                                            placeholder="Log today's weight (kg)"
                                            className="input input-bordered input-sm flex-1"
                                        />
                                        <button
                                            onClick={async () => {
                                                if (!dailyWeightInput) return
                                                await axios.post("https://fitness-tracker-y6q9.onrender.com/api/weight", { weight: parseFloat(dailyWeightInput) }, getAuthHeaders())
                                                toast.success("Weight logged!")
                                                setDailyWeightInput("")
                                                fetchWeight()
                                            }}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Log
                                        </button>
                                    </div>
                                )}

                                <span className="text-xs text-primary cursor-pointer mt-2" onClick={() => navigate("/weekly")}>
                                    See full trend →
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Widget */}
            <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}>
                {chatOpen && (
                    <div className="card bg-base-100 shadow-2xl mb-4" style={{ width: "360px", height: "500px", display: "flex", flexDirection: "column" }}>
                        <div className="bg-primary text-primary-content px-4 py-3 rounded-t-2xl flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5" />
                                <div>
                                    <p className="font-bold text-sm">Nutrition Coach</p>
                                    <p className="text-xs opacity-75">Ask me anything!</p>
                                </div>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="btn btn-ghost btn-sm btn-circle text-primary-content">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div
                            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
                            ref={(el) => el && el.scrollTo(0, el.scrollHeight)}
                        >
                            {messages.length === 0 && (
                                <div className="text-center mt-8">
                                    <Bot className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
                                    <p className="text-base-content/50 text-sm">Hey {user}! Ask me anything about your nutrition today.</p>
                                    <div className="flex flex-col gap-2 mt-4">
                                        {["How am I doing today?", "What should I eat for dinner?", "Am I getting enough protein?"].map((suggestion) => (
                                            <button key={suggestion} onClick={() => setChatInput(suggestion)} className="btn btn-outline btn-xs btn-primary">
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`rounded-2xl px-4 py-2 max-w-xs text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-content rounded-br-none" : "bg-base-200 text-base-content rounded-bl-none"}`}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-base-200 rounded-2xl rounded-bl-none px-4 py-3">
                                        <span className="loading loading-dots loading-sm"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-base-200 flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Ask your nutrition coach..."
                                className="input input-bordered input-sm flex-1"
                            />
                            <button onClick={sendMessage} className="btn btn-primary btn-sm" disabled={chatLoading}>
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className="btn btn-primary btn-circle shadow-lg"
                    style={{ width: "60px", height: "60px" }}
                >
                    {chatOpen ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                </button>
            </div>
        </div>
    )
}

export default HomePage