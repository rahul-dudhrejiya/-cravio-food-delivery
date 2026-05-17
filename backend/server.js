// ============================================================
// FILE: backend/server.js
// WHAT CHANGED:
//   - FIXED: Duplicate app.use("/images"...) removed (was declared twice)
//   - CLOUDINARY: Removed static file serving — images now on Cloudinary
//     (keeping /images route for backward compat but not needed)
//   - Cleaned up: removed duplicate dotenv import
// ============================================================

import express from "express"
import cors from "cors"
import "dotenv/config"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import aiRouter from "./routes/aiRoute.js"

const app = express()
const port = process.env.PORT || 5000

// ── Middlewares ───────────────────────────
app.use(cors())
app.use(express.json())

// Static image serving (for any old local images in uploads/)
// Cloudinary images don't need this — they have their own URL
app.use("/images", express.static("uploads"))

// ── Connect Database ──────────────────────
connectDB()

// ── API Routes ────────────────────────────
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/ai", aiRouter)

// ── Health Check ──────────────────────────
app.get("/", (req, res) => {
    res.send("✅ Cravio API is running!")
})

// ── Start Server ──────────────────────────
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`)
})