import mongoose from "mongoose"

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,  // Now stores Cloudinary https:// URL
        required: true,
    },
    cloudinary_id: {
        type: String,   // Stores Cloudinary public_id for deletion
        default: ""
    },
    category: {
        type: String,
        required: true,
    },
})

const foodModel = mongoose.models.food || mongoose.model("Food", foodSchema)

export default foodModel