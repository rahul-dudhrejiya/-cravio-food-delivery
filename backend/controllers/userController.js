import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

// Generate signed JWT token with 7-day expiration
const createToken = (id, role = "user") => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// ── Login User ─────────────────────────────────────────────
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = createToken(user._id, user.role);
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.log("loginUser error:", error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
}

// ── Register User ──────────────────────────────────────────
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const exists = await userModel.findOne({ email: normalizedEmail });
        if (exists) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        // Validate email format
        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address" });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "user",
        });

        const user = await newUser.save();
        const token = createToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.log("registerUser error:", error);
        res.status(500).json({ success: false, message: "Server error during registration" });
    }
}

// ── Get User Profile ───────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("getProfile error:", error);
        res.status(500).json({ success: false, message: "Error fetching profile" });
    }
}

export { loginUser, registerUser, getProfile } 