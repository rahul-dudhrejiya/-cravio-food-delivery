import express from "express"
import { addFood, listFood, removeFood } from "../controllers/foodController.js"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"

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

const upload = multer({ storage })

// ── Routes ────────────────────────────────
foodRouter.post("/add", upload.single("image"), addFood)
foodRouter.get("/list", listFood)
foodRouter.post("/remove", removeFood)

export default foodRouter