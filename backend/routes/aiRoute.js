import express from "express"
import { GoogleGenerativeAI } from "@google/generative-ai"
import foodModel from "../models/foodModel.js"
import { aiLimiter } from "../middleware/rateLimiter.js"

const aiRouter = express.Router()

aiRouter.post("/recommend", aiLimiter, async (req, res) => {
    let { mood, menuText } = req.body

    // 1. Input validation & sanitization
    if (!mood || typeof mood !== "string" || !mood.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please tell us what kind of food or mood you are in."
        })
    }

    // Limit input length to prevent prompt injection and token abuse
    const sanitizedMood = mood.trim().slice(0, 120)

    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
            success: false,
            message: "AI recommendations are temporarily unavailable."
        })
    }

    try {
        // 2. If client did not provide menuText, fetch it directly from database
        if (!menuText) {
            const foods = await foodModel.find({}, "name category price description").limit(30)
            menuText = foods
                .map(f => `${f.name} (₹${f.price}) - ${f.category} - ${f.description}`)
                .join("\n")
        }

        // 3. Initialize Gemini with structured JSON configuration
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        })

        const prompt = `
You are a helpful culinary assistant for Cravio, a pure vegetarian food delivery service.
Rule: Recommend exactly 2 suitable pure veg dishes from the menu below based on the customer's mood.

Customer mood: "${sanitizedMood}"

Available Menu:
${menuText}

Respond ONLY with this JSON schema:
{
  "message": "A friendly, warm 1-sentence food recommendation reason",
  "items": ["Dish Name 1", "Dish Name 2"]
}
`

        const result = await model.generateContent(prompt)
        const rawText = result.response.text()

        let parsed
        try {
            parsed = JSON.parse(rawText)
        } catch {
            // Fallback parsing if needed
            const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim()
            parsed = JSON.parse(cleaned)
        }

        return res.status(200).json({
            success: true,
            data: parsed
        })

    } catch (error) {
        console.error("AI route error:", error.message)

        // Intelligent local keyword-based fallback
        const moodLower = sanitizedMood.toLowerCase()
        let items = []

        if (moodLower.includes("spicy")) {
            items = ["Samosa", "Veg Momos"]
        } else if (moodLower.includes("rice") || moodLower.includes("biryani")) {
            items = ["Veg Biryani", "Jeera Rice"]
        } else if (moodLower.includes("paneer")) {
            items = ["Paneer Butter Masala", "Palak Paneer"]
        } else if (moodLower.includes("light") || moodLower.includes("healthy") || moodLower.includes("diet")) {
            items = ["Kachumber Salad", "Sprouts Salad"]
        } else if (moodLower.includes("sweet") || moodLower.includes("dessert")) {
            items = ["Gulab Jamun", "Rice Kheer"]
        } else {
            items = ["Veg Biryani", "Paneer Butter Masala"]
        }

        return res.status(200).json({
            success: true,
            data: {
                message: "Here are chef recommendations matching your mood 🍛",
                items
            }
        })
    }
})

export default aiRouter