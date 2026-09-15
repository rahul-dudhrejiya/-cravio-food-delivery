/* ============================================================
   FILE: frontend/src/pages/MyOrders/MyOrders.jsx
   CHANGES:
   - Added loading state
   - Added status color coding
   - $ → ₹
   - Cleaner layout
   ============================================================ */

import { useContext, useEffect, useState, useCallback } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'


const StatusBar = ({ status }) => {
    if (status === "Payment Pending") {
        return (
            <div className="status-banner status-pending">
                <span>⏳</span> Awaiting Payment Confirmation
            </div>
        )
    }
    if (status === "Payment Failed") {
        return (
            <div className="status-banner status-failed">
                <span>❌</span> Payment Failed — Order Not Processed
            </div>
        )
    }
    if (status === "Cancelled") {
        return (
            <div className="status-banner status-cancelled">
                <span>🚫</span> Order Cancelled
            </div>
        )
    }

    const steps = ["Food Processing", "Out for delivery", "Delivered"]
    const current = steps.indexOf(status)

    return (
        <div className="status-progress">
            {steps.map((step, i) => (
                <div key={i} className="status-wrapper">
                    {/* Step */}
                    <div className={`status-step ${i <= current ? 'active' : ''}`}>
                        <div className="status-dot">
                            {i <= current ? "✓" : i + 1}
                        </div>
                        <p>{step}</p>
                    </div>

                    {/* Line */}
                    {i < steps.length - 1 && (
                        <div
                            className={`status-line ${i < current ? 'active' : ''}`}
                        ></div>
                    )}
                </div>
            ))}
        </div>
    )
}

const MyOrders = () => {

    const navigate = useNavigate();
    const { url, token, setShowLogin } = useContext(StoreContext)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [trackingId, setTrackingId] = useState(null)

    const fetchOrders = useCallback(async () => {
        if (!token) {
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            const response = await axios.post(
                url + "/api/order/userorders",
                {},
                { headers: { token } }
            )
            setData(response.data.data || [])
        } catch (error) {
            console.log("Error fetching orders:", error)
        } finally {
            setLoading(false)
        }
    }, [url, token])

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }
        fetchOrders()
    }, [token, fetchOrders])

    // ── Status color helper ──────────────────
    const getStatusColor = (status) => {
        if (status === "Delivered") return "#2d8a00"
        if (status === "Out for delivery") return "#f0a500"
        return "var(--orange)"
    }

    // ── AI Smart Receipt Message ──────────────────
    const getAiMessage = (order) => {
        const items = order.items || []
        const messages = [
            `Great choice! Your order of ${items.length} items is being prepared with love 🍛`,
            `Yum! ₹${order.amount} well spent on delicious pure veg food! 🌿`,
            `Your food is on its way! Sit back and relax 😊`,
            `Pure veg goodness incoming! Your ${items[0]?.name || "meal"} will be amazing 🔥`,
        ]

        // Deterministic message selection
        const idx = (order._id || "a").charCodeAt(0) % messages.length
        return messages[idx]
    }

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            {!token ? (
                <div className="my-orders-empty">
                    <div className="empty-icon">🔒</div>
                    <h3>Sign In to View Your Orders</h3>
                    <p>Sign in to view your live order status, receipt history, and delivery tracking.</p>
                    <button onClick={() => setShowLogin(true)}>
                        Sign In Now →
                    </button>
                </div>
            ) : loading ? (
                <div className="my-orders-loading">
                    <div className="spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="my-orders-empty">
                    <div className="empty-icon">📦</div>
                    <h3>No orders yet</h3>
                    <p>Looks like you haven't ordered anything yet.</p>
                    <button onClick={() => navigate('/')}>
                        Order Now →
                    </button>
                </div>
            ) : (
                <div className='my-orders-container'>
                    {data.map((order) => (
                        <div key={order._id} className="my-orders-order">

                            <img src={assets.parcel_icon} alt="parcel" />

                            <p className="order-items-text">
                                {(order.items || []).map((item, i) =>
                                    i === (order.items || []).length - 1
                                        ? `${item.name} × ${item.quantity}`
                                        : `${item.name} × ${item.quantity}, `
                                )}
                            </p>

                            <div className="order-price-info">
                                <p className="order-amount">₹{order.amount}.00</p>
                                {order.discount > 0 && (
                                    <span className="order-discount-saved">
                                        🎉 Saved ₹{order.discount} {order.coupon ? `(${order.coupon})` : ''}
                                    </span>
                                )}
                            </div>

                            <p className="order-count">Items: {order.items?.length || 0}</p>

                            <p className="order-status" style={{ color: getStatusColor(order.status) }}>
                                ● <b>{order.status}</b>
                            </p>

                            {/* Live order progress bar for this specific order */}
                            <StatusBar status={order.status} />

                            <p className="ai-order-msg">
                                🍛 {getAiMessage(order)}
                            </p>

                            <button
                                onClick={async () => {
                                    setTrackingId(order._id)
                                    await fetchOrders()
                                    setTrackingId(null)
                                }}
                                disabled={trackingId === order._id}
                            >
                                {trackingId === order._id ? "Refreshing..." : "Track Order"}
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyOrders