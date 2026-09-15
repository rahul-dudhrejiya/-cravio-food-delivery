import foodModel from "../models/foodModel.js"
import cloudinary from "../config/cloudinary.js"

// ─────────────────────────────────────────
// ADD FOOD
// POST /api/food/add
// Body: form-data (name, description, price, category, image FILE)
// ─────────────────────────────────────────
const addFood = async (req, res) => {
    try {
        const { name, description, price, category } = req.body

        if (!name || !description || !price || !category) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const numericPrice = Number(price)
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ success: false, message: "Price must be a valid positive number" })
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Food image is required" })
        }

        const food = new foodModel({
            name: name.trim(),
            description: description.trim(),
            price: numericPrice,
            category: category.trim(),
            image: req.file.path,              // Cloudinary secure URL
            cloudinary_id: req.file.filename,  // Cloudinary public_id used for deletion
        })

        await food.save()
        res.status(201).json({ success: true, message: "Food Added Successfully" })

    } catch (error) {
        console.log("addFood error:", error)
        res.status(500).json({ success: false, message: "Error adding food item" })
    }
}

// ─────────────────────────────────────────
// LIST ALL FOOD
// GET /api/food/list
// Returns all food items from database
// ─────────────────────────────────────────
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.status(200).json({ success: true, data: foods })
    } catch (error) {
        console.log("listFood error:", error)
        res.status(500).json({ success: false, message: "Error fetching food list" })
    }
}

// ─────────────────────────────────────────
// REMOVE FOOD
// POST /api/food/remove
// Body: { id: "food_id" }
// ─────────────────────────────────────────
const removeFood = async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).json({ success: false, message: "Food ID is required" })
        }

        const food = await foodModel.findById(id)
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" })
        }

        // Delete image from Cloudinary cloud storage
        if (food.cloudinary_id) {
            try {
                await cloudinary.uploader.destroy(food.cloudinary_id)
            } catch (cloudErr) {
                console.log("Cloudinary image deletion failed:", cloudErr)
            }
        }

        // Delete document from MongoDB
        await foodModel.findByIdAndDelete(id)
        res.status(200).json({ success: true, message: "Food Removed Successfully" })

    } catch (error) {
        console.log("removeFood error:", error)
        res.status(500).json({ success: false, message: "Error removing food item" })
    }
}

export { addFood, listFood, removeFood }

