import { useState, useEffect, useRef } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom"
import { Flame, Droplets, Scale, Beef } from "lucide-react"
import StatTile from "../components/StatTile"
import CalorieGauge from "../components/home/CalorieGauge"
import MacroTable from "../components/home/MacroTable"
import FoodSearchCard from "../components/home/FoodSearchCard"
import MealSection from "../components/home/MealSection"
import WaterCard from "../components/home/WaterCard"
import WeightCard from "../components/home/WeightCard"
import ChatWidget from "../components/home/ChatWidget"
import { API_URL } from "../api"

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
    const glassesRef = useRef(0)
    const confirmedGlassesRef = useRef(0)
    const waterQueueRef = useRef(Promise.resolve())
    const { accessToken, refreshAccessToken, user } = useAuth()
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
                axios.get(`${API_URL}/api/logs`, getAuthHeaders()),
                axios.get(`${API_URL}/api/profile`, getAuthHeaders())
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
            const res = await axios.get(`${API_URL}/api/water`, getAuthHeaders())
            glassesRef.current = res.data.glasses
            confirmedGlassesRef.current = res.data.glasses
            setGlasses(res.data.glasses)
        } catch (error) {
            console.error("Error fetching water", error)
        }
    }

    const fetchWeight = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/weight/history`, getAuthHeaders())
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
                `${API_URL}/api/nutrition`,
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
                        `${API_URL}/api/nutrition`,
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
            await axios.post(`${API_URL}/api/logs`, { ...food, mealType }, getAuthHeaders())
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
            await axios.delete(`${API_URL}/api/logs/${id}`, getAuthHeaders())
            toast.success("Removed from log")
            fetchLogs()
        } catch (error) {
            toast.error("Failed to delete log")
        }
    }

    // Water: update the UI immediately and send saves one at a time, in order,
    // so rapid clicks neither lose updates nor arrive out of order.
    const changeGlasses = (delta) => {
        const next = Math.min(GOAL, Math.max(0, glassesRef.current + delta))
        if (next === glassesRef.current) return
        glassesRef.current = next
        setGlasses(next)
        waterQueueRef.current = waterQueueRef.current.then(async () => {
            try {
                await axios.post(`${API_URL}/api/water`, { glasses: next }, getAuthHeaders())
                confirmedGlassesRef.current = next
            } catch {
                toast.error("Failed to update water")
                glassesRef.current = confirmedGlassesRef.current
                setGlasses(confirmedGlassesRef.current)
            }
        })
    }

    const handleSetStartingWeight = async () => {
        if (!weightInput) return
        try {
            await axios.post(`${API_URL}/api/weight/start`, { weight: parseFloat(weightInput) }, getAuthHeaders())
            toast.success("Starting weight set!")
            setWeightInput("")
            await fetchWeight()
        } catch (error) {
            toast.error("Starting weight already set — reset history to change it")
        }
    }

    const fetchSavedMeals = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/saved-meals`, getAuthHeaders())
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
                `${API_URL}/api/ai/advice`,
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

    // Handlers moved out of inline JSX (bodies unchanged)
    const handleAddSavedMeal = async (meal, mealType) => {
        await axios.post(`${API_URL}/api/logs`, {
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
    }

    const handleResetWeight = async () => {
        await axios.delete(`${API_URL}/api/weight/reset`, getAuthHeaders())
        setWeightHistory([])
        setStartingWeight(null)
        toast.success("Weight history cleared")
    }

    const handleLogWeight = async () => {
        if (!dailyWeightInput) return
        await axios.post(`${API_URL}/api/weight`, { weight: parseFloat(dailyWeightInput) }, getAuthHeaders())
        toast.success("Weight logged!")
        setDailyWeightInput("")
        fetchWeight()
    }

    // Derived display values
    const ML_PER_GLASS = 250
    const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0)
    const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0)
    const totalFat = logs.reduce((sum, log) => sum + log.fat, 0)
    const targets = calorieGoal ? {
        protein: Math.round((calorieGoal * 0.30) / 4),
        carbs: Math.round((calorieGoal * 0.45) / 4),
        fat: Math.round((calorieGoal * 0.25) / 9),
    } : { protein: null, carbs: null, fat: null }

    const currentWeight = weightHistory.length > 0
        ? weightHistory[weightHistory.length - 1].weight
        : (startingWeight ? startingWeight.weight : null)
    const weightSub = startingWeight && weightHistory.length > 0
        ? `${Math.abs(currentWeight - startingWeight.weight).toFixed(1)} kg ${currentWeight < startingWeight.weight ? "lost" : "gained"}`
        : "Not logged yet"

    const macroRows = [
        { label: "Protein", intake: totalProtein, goal: targets.protein, unit: "g", decimals: 1, dot: "bg-primary", fill: "text-primary", stack: true },
        { label: "Carbs", intake: totalCarbs, goal: targets.carbs, unit: "g", decimals: 1, dot: "bg-neutral", fill: "text-neutral", stack: true },
        { label: "Fat", intake: totalFat, goal: targets.fat, unit: "g", decimals: 1, dot: "bg-warning", fill: "text-warning", stack: true },
        { label: "Calories", intake: totalCalories, goal: calorieGoal, unit: " kcal", decimals: 0, dot: "bg-base-content/30", fill: "", stack: false },
    ]

    const meals = [
        { key: "breakfast", label: "Breakfast", time: "8:00 AM - 11:00 AM" },
        { key: "lunch", label: "Lunch", time: "12:00 PM - 3:00 PM" },
        { key: "snacks", label: "Snacks", time: "Anytime" },
        { key: "dinner", label: "Dinner", time: "6:30 PM - 10:00 PM" },
    ]

    const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

    return (
        <div className="min-h-screen bg-base-200 pb-24">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, {user}</h1>
                    <p className="text-sm text-base-content/60 mt-1">{today}</p>
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatTile
                        icon={Flame}
                        label="Calories"
                        value={totalCalories.toFixed(0)}
                        unit="kcal"
                        sub={calorieGoal ? `of ${calorieGoal} kcal` : "No goal set"}
                    />
                    <StatTile
                        icon={Droplets}
                        label="Water"
                        value={glasses * ML_PER_GLASS}
                        unit="ml"
                        sub={`of ${GOAL * ML_PER_GLASS} ml`}
                    />
                    <StatTile
                        icon={Scale}
                        label="Weight"
                        value={currentWeight !== null ? currentWeight : "-"}
                        unit={currentWeight !== null ? "kg" : ""}
                        sub={weightSub}
                    />
                    <StatTile
                        icon={Beef}
                        label="Protein"
                        value={totalProtein.toFixed(0)}
                        unit="g"
                        sub={targets.protein ? `of ${targets.protein} g` : "Set up profile"}
                    />
                </div>

                {/* Gauge + analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-5">
                        <CalorieGauge consumed={totalCalories} goal={calorieGoal} onSetup={() => navigate("/profile")} />
                    </div>
                    <div className="lg:col-span-7">
                        <MacroTable rows={macroRows} />
                    </div>
                </div>

                {/* Search + meals | water + weight */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <FoodSearchCard
                            activeTab={activeTab} setActiveTab={setActiveTab}
                            query={query} setQuery={setQuery} onSearch={handleSearch} loading={loading}
                            foods={foods} pendingFood={pendingFood} setPendingFood={setPendingFood} onAddToLog={handleAddToLog}
                            savedMeals={savedMeals} pendingMeal={pendingMeal} setPendingMeal={setPendingMeal} onAddSavedMeal={handleAddSavedMeal}
                            onManageMeals={() => navigate("/meals")}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {meals.map(({ key, label, time }) => (
                                <MealSection
                                    key={key}
                                    label={label}
                                    time={time}
                                    logs={grouped[key] || []}
                                    collapsed={collapsedMeals[key]}
                                    onToggle={() => setCollapsedMeals(prev => ({ ...prev, [key]: !prev[key] }))}
                                    onDelete={handleDeleteLog}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <WaterCard
                            glasses={glasses}
                            goal={GOAL}
                            mlPerGlass={ML_PER_GLASS}
                            onAdd={() => changeGlasses(1)}
                            onRemove={() => changeGlasses(-1)}
                        />
                        <WeightCard
                            startingWeight={startingWeight}
                            weightHistory={weightHistory}
                            weightInput={weightInput} setWeightInput={setWeightInput}
                            dailyWeightInput={dailyWeightInput} setDailyWeightInput={setDailyWeightInput}
                            onSetStart={handleSetStartingWeight}
                            onLog={handleLogWeight}
                            onReset={handleResetWeight}
                            onTrend={() => navigate("/weekly")}
                        />
                    </div>
                </div>
            </main>

            <ChatWidget
                open={chatOpen} setOpen={setChatOpen}
                messages={messages} input={chatInput} setInput={setChatInput}
                loading={chatLoading} onSend={sendMessage} user={user}
            />
        </div>
    )
}

export default HomePage
