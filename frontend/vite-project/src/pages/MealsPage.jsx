import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Leaf, ArrowLeft, Search, X, Plus, Trash2 } from "lucide-react"

const MealsPage = () => {
    const [savedMeals, setSavedMeals] = useState([])
    const [mealName, setMealName] = useState("")
    const [mealItems, setMealItems] = useState([])
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [creating, setCreating] = useState(false)
    const { accessToken, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => { fetchSavedMeals() }, [])

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const fetchSavedMeals = async () => {
        try {
            const res = await axios.get("http://localhost:5001/api/saved-meals", getAuthHeaders())
            setSavedMeals(res.data)
        } catch (error) {
            console.error("Error fetching saved meals", error)
        }
    }
    const handleSearch = async () => {
        if (!query.trim()) return
        setSearching(true)
        try {
            const res = await axios.post(
                "http://localhost:5001/api/nutrition",
                { query },
                getAuthHeaders()  // 👈 make sure this is the third argument
            )
            setSearchResults(res.data)
        } catch (error) {
            toast.error("Failed to search food")
        } finally {
            setSearching(false)
        }
    }

    const handleAddItem = (food) => {
        setMealItems(prev => [...prev, food])
        setSearchResults([])
        setQuery("")
        toast.success(`${food.name} added to meal`)
    }

    const handleRemoveItem = (index) => {
        setMealItems(prev => prev.filter((_, i) => i !== index))
    }

    const handleSaveMeal = async () => {
        if (!mealName.trim()) { toast.error("Give your meal a name!"); return }
        if (mealItems.length === 0) { toast.error("Add at least one item!"); return }
        try {
            await axios.post("http://localhost:5001/api/saved-meals", {
                name: mealName,
                items: mealItems
            }, getAuthHeaders())
            toast.success("Meal saved!")
            setMealName("")
            setMealItems([])
            setCreating(false)
            fetchSavedMeals()
        } catch (error) {
            toast.error("Failed to save meal")
        }
    }

    const handleDeleteMeal = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/api/saved-meals/${id}`, getAuthHeaders())
            toast.success("Meal deleted")
            fetchSavedMeals()
        } catch (error) {
            toast.error("Failed to delete meal")
        }
    }

    const totalCalories = mealItems.reduce((sum, item) => sum + item.calories, 0)
    const totalProtein = mealItems.reduce((sum, item) => sum + item.protein, 0)
    const totalCarbs = mealItems.reduce((sum, item) => sum + item.carbs, 0)
    const totalFat = mealItems.reduce((sum, item) => sum + item.fat, 0)

    return (
        <div className="min-h-screen bg-base-200">

            {/* Navbar */}
            <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-6">
                <div className="navbar-start">
                    <Leaf className="w-6 h-6 text-primary mr-2" />
                    <span className="text-xl font-bold text-primary">My Meals</span>
                </div>
                <div className="navbar-end gap-3">
                    <button onClick={() => navigate("/")} className="btn btn-ghost btn-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Home
                    </button>
                    <button onClick={logout} className="btn btn-error btn-sm btn-outline">Logout</button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">My Meals</h1>
                        <p className="text-sm text-base-content/50 mt-1">Save your frequently eaten meals for quick logging</p>
                    </div>
                    {!creating && (
                        <button onClick={() => setCreating(true)} className="btn btn-primary btn-sm">
                            <Plus className="w-4 h-4 mr-1" /> New Meal
                        </button>
                    )}
                </div>

                {/* Create Meal Form */}
                {creating && (
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body gap-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm uppercase tracking-widest text-base-content/50 font-bold">Create New Meal</h2>
                                <button onClick={() => { setCreating(false); setMealItems([]); setMealName("") }} className="btn btn-ghost btn-xs">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Meal name */}
                            <input
                                type="text"
                                value={mealName}
                                onChange={(e) => setMealName(e.target.value)}
                                placeholder="Meal name (e.g. Post Workout Shake)"
                                className="input input-bordered w-full"
                            />

                            {/* Search food */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Search food to add..."
                                    className="input input-bordered flex-1"
                                />
                                <button onClick={handleSearch} className={`btn btn-primary ${searching ? "loading" : ""}`}>
                                    {!searching && <Search className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Search results */}
                            {searchResults.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {searchResults.map((food, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-base-200 rounded-xl">
                                            <div>
                                                <p className="font-medium capitalize text-sm">{food.name}</p>
                                                <p className="text-xs text-base-content/50">
                                                    {food.calories} kcal · P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
                                                </p>
                                            </div>
                                            <button onClick={() => handleAddItem(food)} className="btn btn-primary btn-xs">
                                                + Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Added items */}
                            {mealItems.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs uppercase tracking-widest text-base-content/50 font-bold">Items in this meal</p>
                                    {mealItems.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-base-200 rounded-xl">
                                            <div>
                                                <p className="font-medium capitalize text-sm">{item.name}</p>
                                                <p className="text-xs text-base-content/50">
                                                    {item.calories} kcal · P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                                                </p>
                                            </div>
                                            <button onClick={() => handleRemoveItem(index)} className="btn btn-ghost btn-xs text-error">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Totals */}
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {[
                                            { label: "Calories", value: `${totalCalories.toFixed(0)} kcal` },
                                            { label: "Protein", value: `${totalProtein.toFixed(1)}g` },
                                            { label: "Carbs", value: `${totalCarbs.toFixed(1)}g` },
                                            { label: "Fat", value: `${totalFat.toFixed(1)}g` },
                                        ].map((stat) => (
                                            <div key={stat.label} className="bg-base-300 rounded-xl p-2 text-center">
                                                <p className="text-xs text-base-content/50">{stat.label}</p>
                                                <p className="font-bold text-sm">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={handleSaveMeal} className="btn btn-primary w-full">
                                Save Meal
                            </button>
                        </div>
                    </div>
                )}

                {/* Saved Meals List */}
                {savedMeals.length === 0 && !creating && (
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body items-center text-center py-12">
                            <p className="text-base-content/40 text-sm">No saved meals yet</p>
                            <p className="text-base-content/30 text-xs mt-1">Click "New Meal" to create your first preset meal</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {savedMeals.map((meal) => (
                        <div key={meal._id} className="card bg-base-100 shadow-sm">
                            <div className="card-body py-4 px-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-lg">{meal.name}</p>
                                        <p className="text-xs text-base-content/40 mt-1">
                                            {meal.items.length} item{meal.items.length !== 1 ? "s" : ""} · {meal.totalCalories.toFixed(0)} kcal
                                        </p>
                                    </div>
                                    <button onClick={() => handleDeleteMeal(meal._id)} className="btn btn-ghost btn-xs text-error">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Macros */}
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    {[
                                        { label: "Protein", value: `${meal.totalProtein.toFixed(1)}g`, color: "text-success" },
                                        { label: "Carbs", value: `${meal.totalCarbs.toFixed(1)}g`, color: "text-warning" },
                                        { label: "Fat", value: `${meal.totalFat.toFixed(1)}g`, color: "text-error" },
                                    ].map((macro) => (
                                        <div key={macro.label} className="bg-base-200 rounded-xl p-2 text-center">
                                            <p className="text-xs text-base-content/50">{macro.label}</p>
                                            <p className={`font-bold text-sm ${macro.color}`}>{macro.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Items list */}
                                <div className="flex flex-col gap-1 mt-3">
                                    {meal.items.map((item, index) => (
                                        <p key={index} className="text-xs text-base-content/50 capitalize">
                                            · {item.name} — {item.calories} kcal
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MealsPage