import express from "express"
import { loginUser, registerUser, getProfile } from "../controllers/userController.js"
import authMiddleware from "../middleware/auth.js"
import { authLimiter } from "../middleware/rateLimiter.js"

const userRouter = express.Router()

// Apply strict rate limiting on authentication routes (10 attempts per 15 mins)
userRouter.post("/register", authLimiter, registerUser)
userRouter.post("/login", authLimiter, loginUser)
userRouter.get("/profile", authMiddleware, getProfile)

export default userRouter;