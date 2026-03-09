import mongoose from "mongoose"

const waterLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    glasses: { type: Number, default: 0 },
    date: { type: String, required: true } // "YYYY-MM-DD" format
})

export default mongoose.model("WaterLog", waterLogSchema)