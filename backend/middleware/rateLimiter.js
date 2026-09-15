import rateLimit from "express-rate-limit"

// ── Rate Limiter for Authentication (Register & Login) ──
// Limits brute-force credential attacks (10 attempts per 15 minutes per IP)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    message: {
        success: false,
        message: "Too many login/register attempts from this IP. Please try again after 15 minutes."
    }
})

// ── Rate Limiter for Gemini AI Recommendations ─────────
// Protects Google Gemini API quota and prevents cost exploitation
export const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 15, // 15 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "AI recommendation rate limit reached. Please wait a moment before trying again."
    }
})

// ── General API Limiter ────────────────────────────────
// Prevents high-frequency scrapers and automated DoS attempts across public endpoints
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please slow down."
    }
})
