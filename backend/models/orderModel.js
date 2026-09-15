import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Payment Pending" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  razorpayOrderId: { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },
})

// FIXED: was mongoose.model.order → mongoose.models.order
const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

export default orderModel