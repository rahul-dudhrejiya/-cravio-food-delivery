import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"
import Razorpay from "razorpay"
import crypto from "crypto"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Fixed delivery fee on server
const DELIVERY_FEE = 40

// ── Place Order ──────────────────────────
const placeOrder = async (req, res) => {
    try {
        const { userId, items, address } = req.body

        // 1. Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty or invalid" })
        }

        // 2. Validate address
        if (!address || typeof address !== "object") {
            return res.status(400).json({ success: false, message: "Delivery address is required" })
        }

        // 3. Fetch authentic items from database
        const itemIds = items.map(item => item._id)
        const dbFoods = await foodModel.find({ _id: { $in: itemIds } })

        // Create a lookup map for O(1) access
        const foodMap = new Map(dbFoods.map(food => [String(food._id), food]))

        // 4. Calculate subtotal authoritatively
        let subtotal = 0
        const verifiedOrderItems = []

        for (const item of items) {
            const dbFood = foodMap.get(String(item._id))
            if (!dbFood) {
                return res.status(404).json({
                    success: false,
                    message: `Item not found or no longer available: ${item.name || item._id}`
                })
            }

            const quantity = Number(item.quantity)
            if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for item: ${dbFood.name}`
                })
            }

            subtotal += dbFood.price * quantity

            // Snapshot verified item details (name, price from DB, not client)
            verifiedOrderItems.push({
                _id: dbFood._id,
                name: dbFood.name,
                price: dbFood.price,
                category: dbFood.category,
                image: dbFood.image,
                quantity: quantity,
            })
        }

        // 5. Compute final server-verified total
        const finalTotal = subtotal + DELIVERY_FEE

        // 6. Save order to DB with server-calculated amount
        const newOrder = new orderModel({
            userId: userId,
            items: verifiedOrderItems,
            amount: finalTotal,
            address: address,
        })
        await newOrder.save()

        // 7. Clear user cart
        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        // 8. Create Razorpay order with server-calculated amount (in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(finalTotal * 100),
            currency: "INR",
            receipt: String(newOrder._id),
        })

        res.status(201).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: newOrder._id,
        })

    } catch (error) {
        console.log("placeOrder error:", error)
        res.status(500).json({ success: false, message: "Error placing order" })
    }
}

// ── Verify Razorpay Signature ────────────
const verifyOrder = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId
    } = req.body

    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex")

        if (expectedSig === razorpay_signature) {
            await orderModel.findByIdAndUpdate(orderId, { payment: true })
            res.json({ success: true, message: "Payment verified" })
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false, message: "Invalid signature" })
        }

    } catch (error) {
        console.log("verifyOrder error:", error)
        res.json({ success: false, message: "Verification error" })
    }
}

// ── User Orders ──────────────────────────
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId })
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// ── List All Orders (Admin) ───────────────
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// ── Update Status (Admin) ─────────────────
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status })
        res.json({ success: true, message: "Status updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus }