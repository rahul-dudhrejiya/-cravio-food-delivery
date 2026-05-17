import { useState, useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import './AiRecommend.css'

const AiRecommend = () => {

    const { food_list, addToCart, url } = useContext(StoreContext)
    const [open, setOpen] = useState(false)
    const [mood, setMood] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState("")

    const getRecommendation = async () => {
        if (!mood.trim()) return

        setLoading(true)
        setResult(null)
        setError("")

        try {
            // Build menu text from food list
            const menuText = food_list
                .map(f => `${f.name} (₹${f.price}) - ${f.category} - ${f.description}`)
                .join('\n')

            // BUG FIX: Call YOUR backend, not Anthropic directly
            const response = await fetch(url + "/api/ai/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mood, menuText })
            })

            const data = await response.json()

            if (!data.success) {
                setError("Could not get recommendation. Try again!")
                return
            }

            // Match AI suggested names with actual food_list items
            const matched = data.data.items
                .map(name =>
                    food_list.find(f =>
                        f.name.toLowerCase().includes(name.toLowerCase()) ||
                        name.toLowerCase().includes(f.name.toLowerCase())
                    )
                )
                .filter(Boolean)   // remove unmatched

            // BUG FIX 2: If no items matched, show best guess from category
            if (matched.length === 0) {
                const fallback = food_list.slice(0, 2)
                setResult({
                    message: "Here are some of our popular items you might enjoy! 🍛",
                    foods: fallback
                })
                return
            }

            setResult({
                message: data.data.message,
                foods: matched
            })

        } catch (err) {
            console.log("AI error:", err)
            setError("Something went wrong. Please try again!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Floating AI Button */}
            <button
                className="ai-float-btn"
                onClick={() => setOpen(!open)}
                title="AI Food Recommendation"
            >
                {open ? '✕' : '🤖'}
            </button>

            {/* AI Panel */}
            {open && (
                <div className="ai-panel">

                    {/* Header */}
                    <div className="ai-header">
                        <span>🤖</span>
                        <div>
                            <h4>AI Food Assistant</h4>
                            <p>Tell me your mood, I'll suggest food!</p>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="ai-input-row">
                        <input
                            type="text"
                            placeholder="e.g. I want something spicy..."
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && getRecommendation()}
                        />
                        <button
                            onClick={getRecommendation}
                            disabled={loading || !mood.trim()}
                        >
                            {loading ? '...' : '→'}
                        </button>
                    </div>

                    {/* Quick mood tags */}
                    <div className="ai-quick-moods">
                        {[
                            { emoji: '🌶️', text: 'Spicy food' },
                            { emoji: '😋', text: 'Comfort food' },
                            { emoji: '🥗', text: 'Something light' },
                            { emoji: '💰', text: 'Budget friendly' },
                            { emoji: '🍚', text: 'Rice dishes' },
                            { emoji: '🧀', text: 'Paneer items' },
                        ].map(m => (
                            <span
                                key={m.text}
                                onClick={() => setMood(m.text)}
                            >
                                {m.emoji} {m.text}
                            </span>
                        ))}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="ai-loading">
                            <div className="ai-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <p>AI is thinking...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="ai-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Results */}
                    {result && !loading && (
                        <div className="ai-result">
                            <p className="ai-message">💬 {result.message}</p>
                            <div className="ai-food-list">
                                {result.foods.map((food, i) => (
                                    <div key={i} className="ai-food-item">
                                        <img src={food.image} alt={food.name} />
                                        <div className="ai-food-info">
                                            <p>{food.name}</p>
                                            <span>₹{food.price}</span>
                                        </div>
                                        <button
                                            className="ai-add-btn"
                                            onClick={() => {
                                                addToCart(food._id)
                                            }}
                                        >
                                            Add +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </>
    )
}

export default AiRecommend