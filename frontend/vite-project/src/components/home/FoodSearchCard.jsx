import { Search, Plus, ArrowRight } from "lucide-react"
import Card from "../Card"
import AddToMealPicker from "./AddToMealPicker"

const FoodSearchCard = ({
    activeTab, setActiveTab,
    query, setQuery, onSearch, loading,
    foods, pendingFood, setPendingFood, onAddToLog,
    savedMeals, pendingMeal, setPendingMeal, onAddSavedMeal,
    onManageMeals,
}) => {
    const tabClass = (tab) =>
        `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-content" : "text-base-content/70 hover:bg-base-100"}`

    return (
        <Card
            title="Add food"
            action={
                <div className="inline-flex bg-base-200 rounded-full p-1">
                    <button onClick={() => setActiveTab("search")} className={tabClass("search")}>Search</button>
                    <button onClick={() => setActiveTab("meals")} className={tabClass("meals")}>My Meals</button>
                </div>
            }
        >
            {activeTab === "search" && (
                <>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onSearch()}
                            placeholder="e.g. 2 eggs and 1 cup rice"
                            className="input flex-1 min-w-0 rounded-full bg-base-200 border-transparent"
                        />
                        <button onClick={onSearch} className="btn btn-primary rounded-full">
                            {loading ? <span className="loading loading-spinner loading-xs" /> : <Search className="w-4 h-4" />}
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </div>

                    {foods.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {foods.map((food, index) => (
                                <div key={index} className="bg-base-200 rounded-field p-4 flex flex-col gap-2">
                                    <p className="font-semibold capitalize text-sm">{food.name}</p>
                                    <p className="text-2xl font-bold leading-none">
                                        {food.calories}
                                        <span className="text-sm font-normal text-base-content/60 ml-1">kcal</span>
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                        P {food.protein}g · C {food.carbs}g · F {food.fat}g
                                    </p>
                                    {pendingFood?.name === food.name ? (
                                        <AddToMealPicker
                                            onPick={(meal) => onAddToLog(food, meal)}
                                            onCancel={() => setPendingFood(null)}
                                        />
                                    ) : (
                                        <button onClick={() => setPendingFood(food)} className="btn btn-sm btn-neutral rounded-full mt-1">
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === "meals" && (
                <div className="flex flex-col gap-3">
                    {savedMeals.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-base-content/60">No saved meals yet</p>
                            <button onClick={onManageMeals} className="btn btn-primary btn-sm rounded-full mt-3">
                                Create a meal <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        savedMeals.map((meal) => (
                            <div key={meal._id} className="bg-base-200 rounded-field p-4 flex flex-wrap justify-between items-center gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm">{meal.name}</p>
                                    <p className="text-xs text-base-content/60">
                                        {meal.totalCalories.toFixed(0)} kcal · P {meal.totalProtein.toFixed(1)}g · C {meal.totalCarbs.toFixed(1)}g · F {meal.totalFat.toFixed(1)}g
                                    </p>
                                </div>
                                {pendingMeal?._id === meal._id ? (
                                    <div className="w-full sm:w-48">
                                        <AddToMealPicker
                                            onPick={(mealType) => onAddSavedMeal(meal, mealType)}
                                            onCancel={() => setPendingMeal(null)}
                                        />
                                    </div>
                                ) : (
                                    <button onClick={() => setPendingMeal(meal)} className="btn btn-neutral btn-sm rounded-full">
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                    <button onClick={onManageMeals} className="btn btn-ghost btn-sm rounded-full self-end">
                        Manage meals <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </Card>
    )
}

export default FoodSearchCard
