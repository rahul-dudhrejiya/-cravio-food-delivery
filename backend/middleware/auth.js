import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

// ── Authenticate User Middleware ───────────────────────────
const authMiddleware = async (req, res, next) => {
    // 1. Support machine-to-machine admin secret token from decoupled admin dashboards
    const adminHeader = req.headers["admin-token"] || req.headers["admintoken"]
    const adminSecret = process.env.ADMIN_SECRET || process.env.JWT_SECRET
    if (adminHeader && adminSecret && adminHeader === adminSecret) {
        req.user = {
            id: "admin",
            role: "admin",
        }
        return next()
    }

    let token = req.headers.token

    // Also support standard Authorization: Bearer <token>
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized. Please login again." })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
            id: decoded.id,
            role: decoded.role || "user",
        }

        // Backward compatibility for existing controllers reading req.body.userId
        if (req.body && typeof req.body === "object") {
            req.body.userId = decoded.id
        }

        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Session expired. Please login again." })
        }
        return res.status(401).json({ success: false, message: "Invalid authentication token." })
    }
}

// ── Authorize Admin Middleware ─────────────────────────────
const adminMiddleware = async (req, res, next) => {
    // 1. Check if authenticated user has role === 'admin'
    if (req.user && req.user.role === "admin") {
        return next()
    }

    // 2. Allow fallback check directly from database if role wasn't in JWT
    if (req.user && req.user.id) {
        try {
            const user = await userModel.findById(req.user.id)
            if (user && user.role === "admin") {
                req.user.role = "admin"
                return next()
            }
        } catch (err) {
            console.error("adminMiddleware DB lookup error:", err)
        }
    }

    // 3. Allow secret admin header fallback for decoupled admin deployments
    const adminHeader = req.headers["admin-token"] || req.headers["admintoken"]
    const adminSecret = process.env.ADMIN_SECRET || process.env.JWT_SECRET
    if (adminHeader && adminSecret && adminHeader === adminSecret) {
        return next()
    }

    return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
    })
}

export { authMiddleware, adminMiddleware }
export default authMiddleware