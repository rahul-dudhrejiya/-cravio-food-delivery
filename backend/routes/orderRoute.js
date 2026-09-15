import express from "express"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, validateCoupon } from "../controllers/orderController.js"

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/validate-coupon", authMiddleware, validateCoupon);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", authMiddleware, adminMiddleware, listOrders);
orderRouter.post("/status", authMiddleware, adminMiddleware, updateStatus);

export default orderRouter;