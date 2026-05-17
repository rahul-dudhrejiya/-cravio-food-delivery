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
    const { url, token } = useContext(StoreContext)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const response = await axios.post(
                url + "/api/order/userorders",
                {},
                { headers: { token } }
            )
            setData(response.data.data)
        } catch (error) {
            console.log("Error fetching orders:", error)
        } finally {
            setLoading(false)
        }
    }, [url, token, setData, setLoading])

    useEffect(() => {
        if (!token) return;

        const loadOrders = async () => {
            setLoading(true);
            try {
                await fetchOrders();
            } finally {
                setLoading(false)
            }
        };

        loadOrders();
    }, [token, fetchOrders]);

    // ── Status color helper ──────────────────
    const getStatusColor = (status) => {
        if (status === "Delivered") return "#2d8a00"
        if (status === "Out for delivery") return "#f0a500"
        return "var(--orange)"
    }

    // ── AI Smart Receipt Message ──────────────────
    const getAiMessage = (order) => {

        const messages = [
            `Great choice! Your order of ${order.items.length} items is being prepared with love 🍛`,

            `Yum! ₹${order.amount} well spent on delicious pure veg food! 🌿`,

            `Your food is on its way! Sit back and relax 😊`,

            `Pure veg goodness incoming! Your ${order.items[0]?.name} will be amazing 🔥`,
        ]

        // Deterministic message selection
        const idx = order._id.charCodeAt(0) % messages.length

        return messages[idx]
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />

            <div className='my-orders'>
                <h2>My Orders</h2>
                {loading ? (
                    <div className="my-orders-loading">
                        <div className="spinner"></div>
                        <p>Loading your orders...</p>
                    </div>
                ) : data.length === 0 ? (
                    //this change for empty
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
                        {data.map((order, index) => (
                            <div key={index} className="my-orders-order">

                                <img src={assets.parcel_icon} alt="parcel" />

                                <p className="order-items-text">
                                    {order.items.map((item, i) =>
                                        i === order.items.length - 1
                                            ? `${item.name} × ${item.quantity}`
                                            : `${item.name} × ${item.quantity}, `
                                    )}
                                </p>

                                <p className="order-amount">₹{order.amount}.00</p>

                                <p className="order-count">Items: {order.items.length}</p>

                                <p className="order-status" style={{ color: getStatusColor(order.status) }}>
                                    ● <b>{order.status}</b>
                                </p>

                                <p className="ai-order-msg">
                                    🤖 {getAiMessage(order)}
                                </p>

                                <button onClick={fetchOrders}>Track Order</button>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default MyOrders