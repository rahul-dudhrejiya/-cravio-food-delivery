import { useState, useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import './Cart.css'

const Cart = () => {

  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    discount,
    couponCode,
    couponApplied,
    applyCoupon,
    removeCoupon,
  } = useContext(StoreContext)

  const navigate = useNavigate()
  const DELIVERY_FEE = 40
  const cartFoods = food_list.filter(item => cartItems[item._id] > 0)

  // Only local state — just for the input field
  const [inputCode, setInputCode] = useState("")

  const subtotal = getTotalCartAmount()
  const finalTotal = Math.max(0, subtotal + DELIVERY_FEE - discount)

  return (
    <div className='cart'>
      <h2 className='cart-heading'>Your Cart</h2>

      {cartFoods.length === 0 ? (

        // Empty cart state
        <div className="cart-empty">
          <p className="cart-empty-icon">🛒</p>
          <h3>Your cart is empty</h3>
          <p>Browse our menu and add some delicious food!</p>
          <button onClick={() => navigate('/')}>Browse Menu</button>
        </div>

      ) : (
        <>
          {/* Cart Items Table */}
          <div className="cart-items">
            <div className="cart-items-title">
              <p>Image</p>
              <p>Name</p>
              <p>Price</p>
              <p>Qty</p>
              <p>Total</p>
              <p>Remove</p>
            </div>
            <hr />

            {cartFoods.map((item, index) => (
              <div key={index}>
                <div className='cart-items-title cart-items-item'>
                  <img src={item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{item.price * cartItems[item._id]}</p>
                  <span
                    className='cross'
                    onClick={() => removeFromCart(item._id)}
                  >✕</span>
                </div>
                <hr />
              </div>
            ))}
          </div>

          {/* Bottom: Order Summary + Promo Code */}
          <div className="cart-bottom">

            {/* Left: Order Summary */}
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

              {/* Discount row — only shows when coupon is applied */}
              {couponApplied && discount > 0 && (
                <>
                  <div className="cart-total-details">
                    <p className="discount-label">
                      Discount 🎉 ({couponCode})
                    </p>
                    <p className="discount-amount">- ₹{discount}</p>
                  </div>
                  <hr />
                </>
              )}

              {/* Final Total */}
              <div className="cart-total-details total-final">
                <b>Total</b>
                <b>₹{subtotal === 0 ? 0 : finalTotal}</b>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate('/order')}
              >
                Proceed to Checkout →
              </button>
            </div>

            {/* Right: Promo Code Box */}
            <div className="cart-promocode">
              <p className="promo-title">Have a promo code?</p>

              <div className='cart-promocode-input'>
                <input
                  type="text"
                  placeholder='Enter promo code'
                  value={couponApplied ? couponCode : inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  disabled={couponApplied}
                />
                {couponApplied
                  ? <button
                    className="remove-coupon-btn"
                    onClick={removeCoupon}
                  >Remove</button>
                  : <button
                    className="apply-btn"
                    onClick={() => applyCoupon(inputCode)}
                  >Apply</button>
                }
              </div>

              {/* Available coupon tags — click to auto fill input */}
              {!couponApplied && (
                <div className="coupon-hints">
                  <p>Available codes:</p>
                  <span onClick={() => setInputCode("CRAVIO10")}>
                    CRAVIO10 — 10% off
                  </span>
                  <span onClick={() => setInputCode("WELCOME20")}>
                    WELCOME20 — 20% off
                  </span>
                  <span onClick={() => setInputCode("FIRST50")}>
                    FIRST50 — ₹50 off (1x)
                  </span>
                </div>
              )}

              {/* Success message when coupon applied */}
              {couponApplied && discount > 0 && (
                <div className="coupon-success">
                  ✅ You saved ₹{discount} with <strong>{couponCode}</strong>!
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}

export default Cart