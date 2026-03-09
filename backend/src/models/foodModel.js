import mongoose from "mongoose"

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protien: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fibre: { type: Number, required: true },
},
    { timestamps: true }
)

const food = mongoose.model("Food", foodSchema)

export default food