import express from "express"
import { GoogleGenerativeAI } from "@google/generative-ai"

const aiRouter = express.Router()

aiRouter.post("/recommend", async (req, res) => {

    // MOVE OUTSIDE try block
    const { mood, menuText } = req.body

    try {

        if (!mood || !menuText) {
            return res.json({
                success: false,
                message: "Missing mood or menu"
            })
        }

        if (!process.env.GEMINI_API_KEY) {
            console.log("GEMINI_API_KEY missing!")

            return res.json({
                success: false,
                message: "AI not configured"
            })
        }

        // Gemini initialize
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        })

        const prompt = `
You are a food assistant for Cravio, a pure veg food delivery app.

Customer mood:
"${mood}"

Menu:
${menuText}

Suggest 2 food items.

Return ONLY valid JSON:
{
  "message":"friendly sentence",
  "items":["food1","food2"]
}
`

        const result = await model.generateContent(prompt)

        const rawText = result.response.text()

        console.log("Gemini raw:", rawText)

        // Clean markdown
        const cleaned = rawText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim()

        let parsed

        try {
            parsed = JSON.parse(cleaned)
        } catch (err) {

            console.log("JSON parse failed")

            const fallback = menuText
                .split("\n")
                .slice(0, 2)
                .map(line => line.split("(")[0].trim())

            return res.json({
                success: true,
                data: {
                    message: "Here are some popular dishes 🍛",
                    items: fallback
                }
            })
        }

        return res.json({
            success: true,
            data: parsed
        })

    } catch (error) {

        console.log("AI route error:", error.message)

        // SAFE fallback
        const moodLower = mood?.toLowerCase() || ""

        let items = []

        if (moodLower.includes("spicy")) {
            items = ["Samosa", "Veg Momos"]
        }
        else if (moodLower.includes("rice")) {
            items = ["Veg Biryani", "Jeera Rice"]
        }
        else if (moodLower.includes("paneer")) {
            items = ["Paneer Butter Masala", "Palak Paneer"]
        }
        else if (
            moodLower.includes("light") ||
            moodLower.includes("healthy")
        ) {
            items = ["Kachumber Salad", "Sprouts Salad"]
        }
        else if (moodLower.includes("sweet")) {
            items = ["Gulab Jamun", "Rice Kheer"]
        }
        else {
            items = ["Veg Biryani", "Paneer Butter Masala"]
        }

        return res.json({
            success: true,
            data: {
                message:
                    "AI is busy right now, but here are great recommendations 🍛",
                items
            }
        })
    }
})

export default aiRouter