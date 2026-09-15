import { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../context/StoreContext'
import './PlaceOrder.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    clearCart,
    url,
    discount,
    couponCode,
    markCouponUsed,
  } = useContext(StoreContext)

  const navigate = useNavigate()
  const DELIVERY_FEE = 40
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID

  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

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

  // Pre-fill user details from session storage
  useEffect(() => {
    const savedName = localStorage.getItem("userName") || ""
    const savedEmail = localStorage.getItem("userEmail") || ""
    if (savedName || savedEmail) {
      const parts = savedName.trim().split(" ")
      const first = parts[0] || ""
      const last = parts.slice(1).join(" ") || ""
      setData(prev => ({
        ...prev,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
        email: prev.email || savedEmail
      }))
    }
  }, [])

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
    if (isPlacingOrder) return

    // Build order items from cart
    let orderItems = []
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] })
      }
    })

    if (orderItems.length === 0) {
      toast.error("Your cart is empty!")
      navigate('/cart')
      return
    }

    setIsPlacingOrder(true)

    try {
      // Step 1: Create order in backend (server validates prices and coupon)
      const response = await axios.post(
        url + "/api/order/place",
        { address: data, items: orderItems, couponCode },
        { headers: { token } }
      )

      if (!response.data.success) {
        toast.error(response.data.message || "Could not create order. Please try again.")
        setIsPlacingOrder(false)
        return
      }

      const { razorpayOrderId, amount, currency, orderId } = response.data

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error("Razorpay failed to load. Check your internet connection.")
        setIsPlacingOrder(false)
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
              clearCart()
              markCouponUsed()
              toast.success("Payment verified! Your delicious food is being prepared 🍳")
              navigate("/myorders")
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed.")
              navigate("/myorders")
            }
          } catch (err) {
            console.error("Verify error:", err)
            toast.error("Verification error. Please contact support.")
            navigate("/myorders")
          } finally {
            setIsPlacingOrder(false)
          }
        },

        prefill: {
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          contact: data.phone,
        },

        theme: { color: "#ff5c1a" },

        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false)
            toast.info("Payment window closed. Your cart items are saved.")
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error("placeOrder error:", error)
      const msg = error.response?.data?.message || "Failed to initiate payment. Please try again."
      toast.error(msg)
      setIsPlacingOrder(false)
    }
  }

  return (
    <form onSubmit={placeOrder} className='place-order'>

      {/* Left: Delivery Information */}
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>

        <div className="multi-fields">
          <input
            required
            name='firstName'
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder='First Name'
          />
          <input
            required
            name='lastName'
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder='Last Name'
          />
        </div>

        <input
          required
          name='email'
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder='Email address'
        />

        <input
          required
          name='street'
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder='Street address'
        />

        <div className="multi-fields">
          <input
            required
            name='city'
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder='City'
          />
          <input
            required
            name='state'
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder='State'
          />
        </div>

        <div className="multi-fields">
          <input
            required
            name='zipcode'
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder='Zip code'
          />
          <input
            required
            name='country'
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder='Country'
          />
        </div>

        <input
          required
          name='phone'
          onChange={onChangeHandler}
          value={data.phone}
          type="tel"
          placeholder='Phone number'
        />
      </div>

      {/* Right: Order Summary */}
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Order Summary</h2>

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{subtotal}</p>
          </div>
          <hr />

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>₹{subtotal === 0 ? 0 : DELIVERY_FEE}</p>
          </div>
          <hr />

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

          <button type='submit' disabled={isPlacingOrder} style={{ opacity: isPlacingOrder ? 0.7 : 1, cursor: isPlacingOrder ? 'not-allowed' : 'pointer' }}>
            {isPlacingOrder ? "Initiating Payment Gateway..." : `Pay ₹${totalAmount} with Razorpay →`}
          </button>
        </div>
      </div>

    </form>
  )
}

export default PlaceOrder