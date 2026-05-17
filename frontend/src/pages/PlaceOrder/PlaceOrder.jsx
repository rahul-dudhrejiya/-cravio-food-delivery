import { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../context/StoreContext'
import './PlaceOrder.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    discount,
    markCouponUsed,
  } = useContext(StoreContext)

  const navigate = useNavigate()
  const DELIVERY_FEE = 40
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID

  // totalAmount at component level — accessible in JSX and functions
  const subtotal = getTotalCartAmount()
  const totalAmount = Math.max(0, subtotal + DELIVERY_FEE - discount)

  const [data, setData] = useState({
    firstName: "", lastName: "",
    email: "", street: "",
    city: "", state: "",
    zipcode: "", country: "",
    phone: ""
  })

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!token) navigate('/cart')
    else if (getTotalCartAmount() === 0) navigate('/cart')
  }, [token, getTotalCartAmount, navigate])

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const placeOrder = async (event) => {
    event.preventDefault()

    // Build order items from cart
    let orderItems = []
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] })
      }
    })

    try {
      // Step 1: Create order in backend
      const response = await axios.post(
        url + "/api/order/place",
        { address: data, items: orderItems, amount: totalAmount },
        { headers: { token } }
      )

      if (!response.data.success) {
        alert("Could not create order. Please try again.")
        return
      }

      const { razorpayOrderId, amount, currency, orderId } = response.data

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert("Razorpay failed to load. Check internet connection.")
        return
      }

      // Step 3: Open Razorpay popup
      const options = {
        key: razorpayKeyId,
        amount: amount,
        currency: currency || "INR",
        name: "Cravio",
        description: "Pure Veg Food Order",
        order_id: razorpayOrderId,

        // After payment success
        handler: async (paymentResponse) => {
          try {
            const verifyRes = await axios.post(url + "/api/order/verify", {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              orderId: orderId,
            })
            if (verifyRes.data.success) {
              markCouponUsed()     // mark one-time coupon as used + clear
              navigate("/myorders")
            } else {
              alert("Payment verification failed.")
              navigate("/")
            }
          } catch (err) {
            console.log("Verify error:", err)
            alert("Verification error. Please contact support.")
          }
        },

        prefill: {
          name: data.firstName + " " + data.lastName,
          email: data.email,
        },

        readonly: { contact: true, email: true },
        hidden: { contact: true },

        theme: { color: "#ff5c1a" },

        modal: {
          ondismiss: () => {
            console.log("Payment popup closed by user")
          }
        }
      }

      const rzp = new window.Razorpay(options)

      rzp.on("payment.failed", (response) => {
        alert("Payment failed: " + response.error.description)
      })

      rzp.open()

    } catch (error) {
      console.log("placeOrder error:", error)
      alert("Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={placeOrder} className='place-order'>

      {/* Left: Delivery Form */}
      <div className='place-order-left'>
        <p className='title'>Delivery Information</p>

        <div className='multi-fields'>
          <input
            required name='firstName'
            onChange={onChangeHandler} value={data.firstName}
            type="text" placeholder='First Name'
          />
          <input
            required name='lastName'
            onChange={onChangeHandler} value={data.lastName}
            type="text" placeholder='Last Name'
          />
        </div>

        <input
          required name='email'
          onChange={onChangeHandler} value={data.email}
          type="email" placeholder='Email Address'
        />

        <input
          required name='street'
          onChange={onChangeHandler} value={data.street}
          type="text" placeholder='Street Address'
        />

        <div className='multi-fields'>
          <input
            required name='city'
            onChange={onChangeHandler} value={data.city}
            type="text" placeholder='City'
          />
          <input
            required name='state'
            onChange={onChangeHandler} value={data.state}
            type="text" placeholder='State'
          />
        </div>

        <div className='multi-fields'>
          <input
            required name='zipcode'
            onChange={onChangeHandler} value={data.zipcode}
            type="text" placeholder='PIN Code'
          />
          <input
            required name='country'
            onChange={onChangeHandler} value={data.country}
            type="text" placeholder='Country'
          />
        </div>

        <input
          required name='phone'
          onChange={onChangeHandler} value={data.phone}
          type="tel" placeholder='Phone Number'
        />
      </div>

      {/* Right: Order Summary */}
      <div className='place-order-right'>
        <div className="cart-total">
          <h2>Order Summary</h2>

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{subtotal}</p>
          </div>
          <hr />

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>₹{DELIVERY_FEE}</p>
          </div>
          <hr />

          {/* Only shows when coupon is applied */}
          {discount > 0 && (
            <>
              <div className="cart-total-details">
                <p className="discount-label">Discount 🎉</p>
                <p className="discount-amount">- ₹{discount}</p>
              </div>
              <hr />
            </>
          )}

          <div className="cart-total-details">
            <b>Total</b>
            <b>₹{totalAmount}</b>
          </div>

          <button type='submit'>
            Pay ₹{totalAmount} with Razorpay →
          </button>
        </div>
      </div>

    </form>
  )
}

export default PlaceOrder