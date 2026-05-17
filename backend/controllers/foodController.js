import foodModel from "../models/foodModel.js";
import cloudinary from "../config/cloudinary.js"
import fs from 'fs';

// ─────────────────────────────────────────
// ADD FOOD
// POST /api/food/add
// Body: form-data (name, description, price, category, image FILE)
// ─────────────────────────────────────────
const addFood = async (req, res) => {
    try {
        // multer-storage-cloudinary already uploaded to Cloudinary
        // req.file.path      = Cloudinary URL (https://res.cloudinary.com/...)
        // req.file.filename  = public_id (used to delete later)

        if (!req.file) {
            return res.json({ success: false, message: "Image is required" })
        }

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            image: req.file.path,      // Cloudinary URL stored in DB
            cloudinary_id: req.file.filename // public_id stored for deletion
        })

        await food.save()
        res.json({ success: true, message: "Food Added Successfully" })

    } catch (error) {
        console.log("addFood error:", error)
        res.json({ success: false, message: "Error adding food" })
    }
};

// ─────────────────────────────────────────
// LIST ALL FOOD
// GET /api/food/list
// Returns all food items from database
// ─────────────────────────────────────────
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        // find({}) = find ALL documents, empty filter = no conditions
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching food list" });
    }
};

// ─────────────────────────────────────────
// REMOVE FOOD
// POST /api/food/remove
// Body: { id: "food_id" }
// ─────────────────────────────────────────
const removeFood = async (req, res) => {
    try {
        // First find the food to get the image filename
        const food = await foodModel.findById(req.body.id);

        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Delete the image file from uploads/ folder
        // WHY? If we don't delete, unused images pile up and waste disk space
        fs.unlink(`uploads/${food.image}`, (err) => {
            if (err) console.log("Image delete error:", err);
        });

        // Delete from database
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing food" });
    }
};

export { addFood, listFood, removeFood };

