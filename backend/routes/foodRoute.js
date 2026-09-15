import express from "express"
import { addFood, listFood, removeFood } from "../controllers/foodController.js"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"

const foodRouter = express.Router()

// ── Cloudinary Storage for Multer ─────────
// Files go directly to Cloudinary, not to disk
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "cravio-foods",      // folder name in your Cloudinary account
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit" }] // auto-resize
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."), false)
        }
    }
})

// Safe upload wrapper to catch Multer errors (e.g. file size limit exceeded)
const handleUpload = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ success: false, message: "Image size must not exceed 5MB." })
                }
                return res.status(400).json({ success: false, message: `Upload error: ${err.message}` })
            }
            return res.status(400).json({ success: false, message: err.message || "Invalid image upload" })
        }
        next()
    })
}

// ── Routes ────────────────────────────────
foodRouter.post("/add", authMiddleware, adminMiddleware, handleUpload, addFood)
foodRouter.get("/list", listFood)
foodRouter.post("/remove", authMiddleware, adminMiddleware, removeFood)

export default foodRouter