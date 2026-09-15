import express from "express"
import { loginUser, registerUser, getProfile, updateProfile, changePassword } from "../controllers/userController.js"
import authMiddleware from "../middleware/auth.js"
import { authLimiter } from "../middleware/rateLimiter.js"

const userRouter = express.Router()

// Apply strict rate limiting on authentication routes (10 attempts per 15 mins)
userRouter.post("/register", authLimiter, registerUser)
userRouter.post("/login", authLimiter, loginUser)
userRouter.get("/profile", authMiddleware, getProfile)
userRouter.put("/profile", authMiddleware, updateProfile)
userRouter.post("/change-password", authMiddleware, authLimiter, changePassword)

export default userRouter;