import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"

// ─────────────────────────────────────────
// ADD ITEM TO CART (Atomic $inc)
// POST /api/cart/add
// ─────────────────────────────────────────
const addToCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId
        const { itemId } = req.body

        if (!itemId) {
            return res.status(400).json({ success: false, message: "Item ID is required" })
        }

        // Verify food item exists in database
        const food = await foodModel.findById(itemId)
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" })
        }

        // Atomic increment: prevents race conditions and handles initialization automatically
        await userModel.findByIdAndUpdate(
            userId,
            { $inc: { [`cartData.${itemId}`]: 1 } },
            { new: true }
        )

        res.status(200).json({ success: true, message: "Added to Cart" })
    } catch (error) {
        console.log("addToCart error:", error)
        res.status(500).json({ success: false, message: "Error adding item to cart" })
    }
}

// ─────────────────────────────────────────
// REMOVE ITEM FROM CART (Atomic $inc or $unset)
// POST /api/cart/remove
// ─────────────────────────────────────────
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId
        const { itemId } = req.body

        if (!itemId) {
            return res.status(400).json({ success: false, message: "Item ID is required" })
        }

        const userData = await userModel.findById(userId)
        if (!userData || !userData.cartData) {
            return res.status(404).json({ success: false, message: "User or cart not found" })
        }

        const currentQty = userData.cartData[itemId] || 0

        if (currentQty > 1) {
            // Decrement atomically
            await userModel.findByIdAndUpdate(userId, {
                $inc: { [`cartData.${itemId}`]: -1 }
            })
        } else {
            // Quantity reached 0: permanently UNSET/delete the key to prevent document bloat
            await userModel.findByIdAndUpdate(userId, {
                $unset: { [`cartData.${itemId}`]: "" }
            })
        }

        res.status(200).json({ success: true, message: "Removed from Cart" })
    } catch (error) {
        console.log("removeFromCart error:", error)
        res.status(500).json({ success: false, message: "Error removing item from cart" })
    }
}

// ─────────────────────────────────────────
// FETCH USER CART DATA
// POST or GET /api/cart/get
// ─────────────────────────────────────────
const getCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId
        const userData = await userModel.findById(userId)

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const rawCart = userData.cartData || {}

        // Sanitize: filter out any legacy keys that were set to 0 or negative
        const cleanCart = {}
        for (const [id, qty] of Object.entries(rawCart)) {
            if (qty > 0) {
                cleanCart[id] = qty
            }
        }

        res.status(200).json({ success: true, cartData: cleanCart })
    } catch (error) {
        console.log("getCart error:", error)
        res.status(500).json({ success: false, message: "Error fetching cart data" })
    }
}

export { addToCart, removeFromCart, getCart }