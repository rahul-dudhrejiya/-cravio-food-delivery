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
import helmet from "helmet"
import mongoose from "mongoose"
import { connectDB } from "./config/db.js"
import { generalLimiter } from "./middleware/rateLimiter.js"
import { mongoSanitize } from "./middleware/sanitize.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import aiRouter from "./routes/aiRoute.js"

const app = express()
const port = process.env.PORT || 5000

// ── Security Headers & Hardening ─────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.disable("x-powered-by")

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
    allowedHeaders: ["Content-Type", "token", "Authorization", "admin-token", "admintoken"]
}))

// Limit payload size to 1MB to prevent JSON bomb memory exhaustion
app.use(express.json({ limit: "1mb" }))

// Sanitize incoming payloads against NoSQL operator injection
app.use(mongoSanitize)

// Static image serving (for any old local images in uploads/)
// Cloudinary images don't need this — they have their own URL
app.use("/images", express.static("uploads"))

// ── General API Rate Limiting ─────────────
app.use("/api", generalLimiter)

// ── Connect Database ──────────────────────
connectDB()

// ── API Routes ────────────────────────────
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/ai", aiRouter)

// ── Health & Diagnostics ──────────────────
const getHealthStatus = () => {
    const stateMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    }
    const dbState = mongoose.connection.readyState
    const isHealthy = dbState === 1

    return {
        isHealthy,
        payload: {
            status: isHealthy ? "ok" : "degraded",
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.round(process.uptime()),
            database: {
                status: stateMap[dbState] || "unknown",
                readyState: dbState
            },
            memory: {
                rssMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
                heapUsedMB: Math.round(process.memoryUsage().heapUsed / (1024 * 1024))
            },
            environment: process.env.NODE_ENV || "development"
        }
    }
}

app.get("/", (req, res) => {
    const { isHealthy, payload } = getHealthStatus()
    res.status(isHealthy ? 200 : 503).json({
        message: "✅ Cravio API is operational",
        ...payload
    })
})

app.get("/healthz", (req, res) => {
    const { isHealthy, payload } = getHealthStatus()
    res.status(isHealthy ? 200 : 503).json(payload)
})

app.get("/api/health", (req, res) => {
    const { isHealthy, payload } = getHealthStatus()
    res.status(isHealthy ? 200 : 503).json(payload)
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
const server = app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`)
})

// ── Graceful Process Termination ─────────
const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`)
    server.close(async () => {
        console.log("🔒 HTTP server closed.")
        try {
            await mongoose.connection.close(false)
            console.log("🔒 MongoDB connection closed cleanly.")
            process.exit(0)
        } catch (err) {
            console.error("Error closing MongoDB connection:", err)
            process.exit(1)
        }
    })

    // Force exit if shutdown hangs beyond 10 seconds
    setTimeout(() => {
        console.error("⚠️ Forcing shutdown after timeout.")
        process.exit(1)
    }, 10000).unref()
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception thrown:", err)
    process.exit(1)
})