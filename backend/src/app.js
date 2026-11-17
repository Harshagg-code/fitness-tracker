import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import foodRoutes from "./routes/foodRoutes.js"
import foodLogRoutes from "./routes/foodLogRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"
import waterRoutes from "./routes/waterRoutes.js"
import weightRoutes from "./routes/weightRoutes.js"
import savedMealRoutes from "./routes/savedMealRoutes.js"

const app = express()

app.use(cors({
    origin: [
        "http://localhost:5173",
        /\.vercel\.app$/
    ],
    credentials: true
}))
app.use(express.json())

app.use("/api", foodRoutes)
app.use("/api/auth", authRoutes)
app.use("/api", foodLogRoutes)
app.use("/api", profileRoutes)
app.use("/api", aiRoutes)
app.use("/api", waterRoutes)
app.use("/api", weightRoutes)
app.use("/api", savedMealRoutes)

export default app