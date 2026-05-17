import { useState, useEffect, useCallback } from 'react'
import './Order.css'
import { toast } from 'react-toastify'
import axios from "axios"
import { assets } from '../../assets/assets'

const Orders = ({ url }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await axios.get(url + "/api/order/list")
      if (response.data.success) {
        setOrders(response.data.data)
      } else {
        toast.error("Error fetching orders")
      }
    } catch (error) {
      toast.error("Could not connect to server")
      console.log(error)
    }
  }, [url])

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value
      })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      toast.error("Error updating status")
      console.log(error)
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
          orders.map((order, index) => (
            <div key={index} className="order-item">

              <img src={assets.parcel_icon} alt="parcel" />

              <div className='order-item-details'>
                <p className='order-item-food'>
                  {order.items.map((item, i) =>
                    i === order.items.length - 1
                      ? `${item.name} × ${item.quantity}`
                      : `${item.name} × ${item.quantity}, `
                  )}
                </p>
                <p className='order-item-name'>
                  {order.address.firstName} {order.address.lastName}
                </p>
                <div className='order-item-address'>
                  <p>{order.address.street},</p>
                  <p>{order.address.city}, {order.address.state}, {order.address.country} - {order.address.zipcode}</p>
                </div>
                <p className='order-item-phone'>{order.address.phone}</p>
              </div>

              <p className='order-item-count'>Items: {order.items.length}</p>

              <p className='order-item-amount'>₹{order.amount}</p>

              {/* FIXED: was value={order.statusHandler} → should be value={order.status} */}
              <select
                onChange={(e) => statusHandler(e, order._id)}
                value={order.status}
                className='order-status-select'
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders