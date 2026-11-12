import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import { Search, X, Plus, Trash2, Utensils } from "lucide-react"
import Card from "../components/Card"
import MacroChips from "../components/MacroChips"
import { API_URL } from "../api"

const MealsPage = () => {
    const [savedMeals, setSavedMeals] = useState([])
    const [mealName, setMealName] = useState("")
    const [mealItems, setMealItems] = useState([])
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [creating, setCreating] = useState(false)
    const { accessToken } = useAuth()

    useEffect(() => { fetchSavedMeals() }, [])

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const fetchSavedMeals = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/saved-meals`, getAuthHeaders())
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
                `${API_URL}/api/nutrition`,
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
            await axios.post(`${API_URL}/api/saved-meals`, {
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
            await axios.delete(`${API_URL}/api/saved-meals/${id}`, getAuthHeaders())
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
        <div className="min-h-screen bg-base-200 pb-10">

            <Navbar />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-4">

                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">My meals</h1>
                        <p className="text-sm text-base-content/60 mt-1">Save meals you eat often for quick logging</p>
                    </div>
                    {!creating && savedMeals.length > 0 && (
                        <button onClick={() => setCreating(true)} className="btn btn-primary btn-sm rounded-full shrink-0">
                            <Plus className="w-4 h-4" /> New meal
                        </button>
                    )}
                </div>

                {/* Create meal */}
                {creating && (
                    <Card
                        title="Create meal"
                        action={
                            <button
                                onClick={() => { setCreating(false); setMealItems([]); setMealName("") }}
                                className="btn btn-ghost btn-sm btn-circle"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        }
                    >
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={mealName}
                                onChange={(e) => setMealName(e.target.value)}
                                placeholder="Meal name (e.g. Post workout shake)"
                                className="input w-full rounded-full bg-base-200 border-transparent"
                            />

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Search a food to add"
                                    className="input flex-1 min-w-0 rounded-full bg-base-200 border-transparent"
                                />
                                <button onClick={handleSearch} className="btn btn-primary rounded-full" aria-label="Search">
                                    {searching ? <span className="loading loading-spinner loading-xs" /> : <Search className="w-4 h-4" />}
                                </button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {searchResults.map((food, index) => (
                                        <div key={index} className="flex justify-between items-center gap-3 bg-base-200 rounded-field p-3">
                                            <div className="min-w-0">
                                                <p className="font-medium capitalize text-sm">{food.name}</p>
                                                <p className="text-xs text-base-content/60">
                                                    {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g
                                                </p>
                                            </div>
                                            <button onClick={() => handleAddItem(food)} className="btn btn-neutral btn-sm rounded-full">
                                                <Plus className="w-4 h-4" /> Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {mealItems.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium">Items in this meal</p>
                                    {mealItems.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center gap-3 bg-base-200 rounded-field p-3">
                                            <div className="min-w-0">
                                                <p className="font-medium capitalize text-sm">{item.name}</p>
                                                <p className="text-xs text-base-content/60">
                                                    {item.calories} kcal · P {item.protein}g · C {item.carbs}g · F {item.fat}g
                                                </p>
                                            </div>
                                            <button onClick={() => handleRemoveItem(index)} className="btn btn-ghost btn-xs btn-circle" aria-label={`Remove ${item.name}`}>
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-content">
                                            {totalCalories.toFixed(0)} kcal
                                        </span>
                                        <MacroChips protein={totalProtein} carbs={totalCarbs} fat={totalFat} />
                                    </div>
                                </div>
                            )}

                            <button onClick={handleSaveMeal} className="btn btn-primary rounded-full w-full">
                                Save meal
                            </button>
                        </div>
                    </Card>
                )}

                {/* Empty state */}
                {savedMeals.length === 0 && !creating && (
                    <Card className="items-center text-center py-12">
                        <span className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center mb-3">
                            <Utensils className="w-5 h-5" />
                        </span>
                        <p className="text-base font-semibold">No saved meals yet</p>
                        <p className="text-sm text-base-content/60 mt-1">Create your first preset meal to log it in one tap.</p>
                        <button onClick={() => setCreating(true)} className="btn btn-primary btn-sm rounded-full mt-4">
                            <Plus className="w-4 h-4" /> New meal
                        </button>
                    </Card>
                )}

                {/* Saved meals */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                    {savedMeals.map((meal) => (
                        <Card key={meal._id}>
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                    <p className="text-base font-semibold truncate">{meal.name}</p>
                                    <p className="text-xs text-base-content/60 mt-1">
                                        {meal.items.length} item{meal.items.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <button onClick={() => handleDeleteMeal(meal._id)} className="btn btn-ghost btn-sm btn-circle" aria-label={`Delete ${meal.name}`}>
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-3xl font-bold leading-none mt-4">
                                {meal.totalCalories.toFixed(0)}
                                <span className="text-sm font-normal text-base-content/60 ml-1">kcal</span>
                            </p>

                            <MacroChips protein={meal.totalProtein} carbs={meal.totalCarbs} fat={meal.totalFat} className="mt-3" />

                            <div className="flex flex-col mt-4">
                                {meal.items.map((item, index) => (
                                    <div key={index} className="flex justify-between gap-3 py-2 border-t border-base-200 text-sm">
                                        <span className="capitalize truncate">{item.name}</span>
                                        <span className="text-base-content/60 shrink-0">{item.calories} kcal</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default MealsPage
