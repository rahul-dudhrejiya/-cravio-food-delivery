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
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://cravio.vercel.app",
    "https://cravio-admin.vercel.app",
    "https://cravio-food-delivery.vercel.app",
]

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server, Postman, mobile apps without browser origin
        if (!origin) return callback(null, true)

        // Check against explicit whitelist
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        // Allow preview deployments ONLY for your specific Cravio project on Vercel
        // Matches e.g.: https://cravio-git-main-yourname.vercel.app
        const isCravioPreview = /^https:\/\/cravio[a-z0-9-]*\.vercel\.app$/.test(origin)
        if (isCravioPreview) {
            return callback(null, true)
        }

        // Reject all other unauthorized domains
        return callback(new Error("CORS policy: Access denied for this origin."), false)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "token", "Authorization"]
}))
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

// ── Global Error Handler ──────────────────
app.use((err, req, res, next) => {
    if (err.message && err.message.includes("CORS")) {
        return res.status(403).json({ success: false, message: err.message })
    }
    console.error("Unhandled error:", err)
    res.status(500).json({ success: false, message: "Internal server error" })
})

// ── Start Server ──────────────────────────
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`)
})