import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: {
    type: String,
    enum: [
      "Payment Pending",
      "Food Processing",
      "Out for delivery",
      "Delivered",
      "Payment Failed",
      "Cancelled",
    ],
    default: "Payment Pending",
  },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  razorpayOrderId: { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },
}, { timestamps: true })

// Compound index for instant order retrieval by user sorted by date descending (O(log N))
orderSchema.index({ userId: 1, date: -1 })

// Index for admin dashboard status filtering
orderSchema.index({ status: 1 })

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

export default orderModel