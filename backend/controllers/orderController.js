import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"
import Razorpay from "razorpay"
import crypto from "crypto"
import { VALID_COUPONS, calculateDiscount } from "../utils/couponEngine.js"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Fixed delivery fee on server
const DELIVERY_FEE = 40

// ── Place Order ──────────────────────────
const placeOrder = async (req, res) => {
    try {
        const { userId, items, address, couponCode } = req.body

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

        // 5. Authoritatively validate and apply coupon if provided
        let discount = 0
        let appliedCouponCode = null

        if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
            const normalizedCode = couponCode.trim().toUpperCase()
            const coupon = VALID_COUPONS[normalizedCode]

            if (!coupon) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid coupon code: ${normalizedCode}`
                })
            }

            if (subtotal < coupon.minOrder) {
                return res.status(400).json({
                    success: false,
                    message: `Coupon ${normalizedCode} requires a minimum order of ₹${coupon.minOrder}`
                })
            }

            if (coupon.oneTime) {
                const alreadyUsed = await orderModel.findOne({
                    userId: userId,
                    coupon: normalizedCode,
                    payment: true
                })
                if (alreadyUsed) {
                    return res.status(400).json({
                        success: false,
                        message: `Coupon ${normalizedCode} can only be used once per customer.`
                    })
                }
            }

            discount = calculateDiscount(coupon, subtotal)
            appliedCouponCode = normalizedCode
        }

        // 6. Compute final server-verified total
        const finalTotal = Math.max(0, subtotal + DELIVERY_FEE - discount)

        // 7. Save order to DB with server-calculated amount and coupon details
        const newOrder = new orderModel({
            userId: userId,
            items: verifiedOrderItems,
            amount: finalTotal,
            coupon: appliedCouponCode,
            discount: discount,
            address: address,
            status: "Payment Pending",
            payment: false,
        })
        await newOrder.save()

        // 7. Create Razorpay order with server-calculated amount (in paise)
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

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: "Missing payment verification parameters"
        })
    }

    try {
        // 1. Verify HMAC-SHA256 signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex")

        const order = await orderModel.findById(orderId)
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" })
        }

        if (expectedSig === razorpay_signature) {
            // 2. Signature valid: mark order paid and update status
            await orderModel.findByIdAndUpdate(orderId, {
                payment: true,
                status: "Food Processing",
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
            })

            // 3. Clear customer's cart now that payment is confirmed
            await userModel.findByIdAndUpdate(order.userId, { cartData: {} })

            return res.status(200).json({ success: true, message: "Payment verified successfully" })
        } else {
            // 4. Signature invalid: NEVER delete order; mark it as Payment Failed for audit
            await orderModel.findByIdAndUpdate(orderId, {
                payment: false,
                status: "Payment Failed"
            })

            return res.status(400).json({ success: false, message: "Invalid payment signature" })
        }

    } catch (error) {
        console.log("verifyOrder error:", error)
        res.status(500).json({ success: false, message: "Verification error" })
    }
}

// ── User Orders ──────────────────────────
const userOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId
        const orders = await orderModel.find({ userId }).sort({ date: -1 })
        res.status(200).json({ success: true, data: orders })
    } catch (error) {
        console.error("userOrders error:", error)
        res.status(500).json({ success: false, message: "Error fetching orders" })
    }
}

// ── List All Orders (Admin) ───────────────
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 })
        res.status(200).json({ success: true, data: orders })
    } catch (error) {
        console.error("listOrders error:", error)
        res.status(500).json({ success: false, message: "Error fetching orders" })
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

// ── Validate Coupon (Authenticated) ───────
const validateCoupon = async (req, res) => {
    try {
        const { userId, couponCode, subtotal } = req.body

        if (!couponCode || typeof couponCode !== "string") {
            return res.status(400).json({ success: false, message: "Coupon code is required" })
        }

        const numSubtotal = Number(subtotal)
        if (isNaN(numSubtotal) || numSubtotal <= 0) {
            return res.status(400).json({ success: false, message: "Add items to cart before applying coupon" })
        }

        const normalizedCode = couponCode.trim().toUpperCase()
        const coupon = VALID_COUPONS[normalizedCode]

        if (!coupon) {
            return res.status(400).json({ success: false, message: "Invalid coupon code!" })
        }

        if (numSubtotal < coupon.minOrder) {
            return res.status(400).json({
                success: false,
                message: `Minimum order of ₹${coupon.minOrder} required for ${normalizedCode}`
            })
        }

        if (coupon.oneTime) {
            const alreadyUsed = await orderModel.findOne({
                userId: userId,
                coupon: normalizedCode,
                payment: true
            })
            if (alreadyUsed) {
                return res.status(400).json({
                    success: false,
                    message: `Coupon ${normalizedCode} can only be used once per customer.`
                })
            }
        }

        const discount = calculateDiscount(coupon, numSubtotal)
        res.status(200).json({
            success: true,
            couponCode: normalizedCode,
            discount,
            label: coupon.label,
            desc: coupon.desc
        })
    } catch (error) {
        console.error("validateCoupon error:", error)
        res.status(500).json({ success: false, message: "Error validating coupon" })
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, validateCoupon }