import mongoose from "mongoose"

const weightSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weight: { type: Number, required: true },
    date: { type: String, required: true } // "YYYY-MM-DD"
}, { timestamps: true })

export default mongoose.model("Weight", weightSchema)