import mongoose from "mongoose"

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    image: {
        type: String,
        required: true,
    },
    cloudinary_id: {
        type: String,
        default: "",
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true })

// Index for instant filtering by category (O(log N))
foodSchema.index({ category: 1 })

const foodModel = mongoose.models.Food || mongoose.model("Food", foodSchema)

export default foodModel