import { useState, useEffect, useCallback } from 'react'
import './Order.css'
import { toast } from 'react-toastify'
import axios from "axios"
import { assets } from '../../assets/assets'

const Orders = ({ url }) => {

  const [orders, setOrders] = useState([])
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await axios.get(url + "/api/order/list")
      if (response.data.success) {
        setOrders(response.data.data || [])
      } else {
        toast.error("Error fetching orders")
      }
    } catch (error) {
      toast.error("Could not connect to server")
      console.log(error)
    }
  }, [url])

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value
    setUpdatingOrderId(orderId)
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: newStatus
      })
      if (response.data.success) {
        toast.success(`Order status updated to "${newStatus}"`)
        await fetchAllOrders()
      } else {
        toast.error(response.data.message || "Failed to update status")
      }
    } catch (error) {
      toast.error("Error updating status")
      console.log(error)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  useEffect(() => {
    (async () => {
      await fetchAllOrders()
    })()
  }, [fetchAllOrders])

  return (
    <div className='orders'>
      <h3 className='orders-title'>All Orders</h3>

      <div className='order-list'>
        {orders.length === 0 ? (
          <div className="orders-empty">No orders yet.</div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-item">

              <img src={assets.parcel_icon} alt="parcel" />

              <div className='order-item-details'>
                <p className='order-item-food'>
                  {(order.items || []).map((item, i) =>
                    i === (order.items || []).length - 1
                      ? `${item.name} × ${item.quantity}`
                      : `${item.name} × ${item.quantity}, `
                  )}
                </p>
                <p className='order-item-name'>
                  {order.address?.firstName || "Customer"} {order.address?.lastName || ""}
                </p>
                <div className='order-item-address'>
                  <p>{order.address?.street || "No street address"},</p>
                  <p>
                    {order.address?.city || ""}{order.address?.state ? `, ${order.address.state}` : ""}
                    {order.address?.country ? `, ${order.address.country}` : ""}
                    {order.address?.zipcode ? ` - ${order.address.zipcode}` : ""}
                  </p>
                </div>
                <p className='order-item-phone'>{order.address?.phone || "No phone"}</p>

                <div className="order-badges">
                  <span className={`payment-badge ${order.payment ? "paid" : "unpaid"}`}>
                    {order.payment ? "● Paid" : "○ Unpaid"}
                  </span>
                  {order.discount > 0 && (
                    <span className="coupon-badge" title={`Coupon: ${order.coupon}`}>
                      🎟️ Saved ₹{order.discount} ({order.coupon})
                    </span>
                  )}
                </div>
              </div>

              <p className='order-item-count'>Items: {order.items?.length || 0}</p>

              <p className='order-item-amount'>₹{order.amount}</p>

              <select
                onChange={(e) => statusHandler(e, order._id)}
                value={order.status}
                className='order-status-select'
                disabled={updatingOrderId === order._id}
              >
                <option value="Payment Pending">Payment Pending ⏳</option>
                <option value="Food Processing">Food Processing 🍳</option>
                <option value="Out for delivery">Out for delivery 🛵</option>
                <option value="Delivered">Delivered ✅</option>
                <option value="Payment Failed">Payment Failed ❌</option>
                <option value="Cancelled">Cancelled 🚫</option>
              </select>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders