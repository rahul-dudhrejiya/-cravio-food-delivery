import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Razorpay from "razorpay"
import crypto from "crypto"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ── Place Order ──────────────────────────
const placeOrder = async (req, res) => {
    try {
        // 1. Save order to DB
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        })
        await newOrder.save()

        // 2. Clear cart
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} })

        // 3. Create Razorpay order (amount in paise = ₹ × 100)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(req.body.amount * 100),
            currency: "INR",
            receipt: String(newOrder._id),
        })

        res.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: newOrder._id,
        })

    } catch (error) {
        console.log("placeOrder error:", error)
        res.json({ success: false, message: "Error placing order" })
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