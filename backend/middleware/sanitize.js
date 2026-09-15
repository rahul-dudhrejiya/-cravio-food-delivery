// ── Recursive NoSQL Sanitization Middleware ───────────────
// Recursively strips out any object keys that start with '$' or contain '.'
// to neutralize NoSQL query operator injection attacks against MongoDB.

const sanitize = (data) => {
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            if (typeof data[i] === "object" && data[i] !== null) {
                sanitize(data[i])
            }
        }
    } else if (typeof data === "object" && data !== null) {
        for (const key of Object.keys(data)) {
            if (key.startsWith("$") || key.includes(".")) {
                delete data[key]
            } else if (typeof data[key] === "object" && data[key] !== null) {
                sanitize(data[key])
            }
        }
    }
    return data
}

export const mongoSanitize = (req, res, next) => {
    if (req.body) sanitize(req.body)
    if (req.query) sanitize(req.query)
    if (req.params) sanitize(req.params)
    next()
}

export default mongoSanitize
