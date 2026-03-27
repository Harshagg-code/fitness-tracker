import SavedMeal from "../models/savedMealModel.js"

export async function getSavedMeals(req, res) {
    try {
        const meals = await SavedMeal.find({ userId: req.user.id }).sort({ createdAt: -1 })
        res.json(meals)
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function createSavedMeal(req, res) {
    try {
        const { name, items } = req.body
        const totalCalories = items.reduce((sum, item) => sum + item.calories, 0)
        const totalProtein = items.reduce((sum, item) => sum + item.protein, 0)
        const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0)
        const totalFat = items.reduce((sum, item) => sum + item.fat, 0)

        const meal = new SavedMeal({
            userId: req.user.id,
            name,
            items,
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat
        })
        await meal.save()
        res.status(201).json(meal)
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function deleteSavedMeal(req, res) {
    try {
        await SavedMeal.findByIdAndDelete(req.params.id)
        res.json({ message: "Meal deleted" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}