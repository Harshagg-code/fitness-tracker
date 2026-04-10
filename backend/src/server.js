import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import { connectDB } from "./config/db.js"
import foodRoutes from "./routes/foodRoutes.js"
import foodLogRoutes from "./routes/foodLogRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"
import waterRoutes from "./routes/waterRoutes.js"
import weightRoutes from "./routes/weightRoutes.js"
import savedMealRoutes from "./routes/savedMealRoutes.js"



dotenv.config()
const app = express()
const PORT = process.env.PORT || 5001


app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://fitness-tracker-c7k11fphx-harshit8.vercel.app",
        /\.vercel\.app$/
    ],
    credentials: true
}))

app.use(express.json());


app.use("/api", foodRoutes)
app.use("/api/auth", authRoutes)
app.use("/api", foodLogRoutes)
app.use("/api", profileRoutes)
app.use("/api", aiRoutes)
app.use("/api", waterRoutes)
app.use("/api", weightRoutes)
app.use("/api", savedMealRoutes)
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on:", PORT);
    })
});