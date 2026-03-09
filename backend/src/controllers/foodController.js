import { response } from "express";
import food from "../models/foodModel.js";
import axios from "axios"

export async function getNutrition(req, res) {

    const { query } = req.body;
    try {


        const response = await axios.get(
            `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
            {
                headers: {
                    "X-Api-Key": process.env.CALORIE_NINJAS_API_KEY,
                },
            }
        );

        if (!response.data.items || response.data.items.length === 0) {
            return res.status(400).json({ error: "No foods found" });
        }

        const foods = response.data.items.map((food) => ({
            name: food.name,
            calories: food.calories,
            protein: food.protein_g,
            carbs: food.carbohydrates_total_g,
            fat: food.fat_total_g,
        }));

        res.json(foods);

    } catch (error) {
        console.log("Error in the getNutrtion controller", error);
        res.status(500).json({ message: "Internal server error" });
    }


}


