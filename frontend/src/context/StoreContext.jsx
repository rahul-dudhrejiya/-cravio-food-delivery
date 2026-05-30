/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

  const [cartItems, setCartItems] = useState({})
  const [token, setToken] = useState("")
  const [food_list, setFoodList] = useState([])
  const [favourites, setFavourites] = useState([])
  const [discount, setDiscount] = useState(0)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)

  const url = "https://cravio-backend-ss5u.onrender.com/"

  // ── Add to cart ──────────────────────────
  const addToCart = async (itemId) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: prev[itemId] ? prev[itemId] + 1 : 1
    }))
    toast.success("Added to cart! 🛒", { autoClose: 1000 })
    if (token) {
      await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } })
    }
  }

  // ── Remove from cart ─────────────────────
  const removeFromCart = async (itemId) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 1) - 1, 0)
    }))
    toast.info("Removed from cart", { autoClose: 1000 })
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } })
    }
  }

  // ── Calculate total ──────────────────────
  const getTotalCartAmount = () => {
    let total = 0
    for (const id in cartItems) {
      if (cartItems[id] > 0) {
        const item = food_list.find(p => p._id === id)
        if (item) total += item.price * cartItems[id]
      }
    }
    return total
  }

  // ── Fetch food list ──────────────────────
  const fetchFoodList = async () => {
    try {
      const res = await axios.get(url + "/api/food/list")
      setFoodList(res.data.data)
    } catch (err) {
      console.log("fetchFoodList error:", err)
    }
  }

  // ── Load cart from backend ───────────────
  const loadCartData = async (token) => {
    try {
      const res = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      )
      setCartItems(res.data.cartData)
    } catch (err) {
      console.log("loadCartData error:", err)
    }
  }

  // ── Favourites ───────────────────────────
  const toggleFavourite = (itemId) => {
    setFavourites(prev => {
      if (prev.includes(itemId)) {
        toast.info("Removed from favourites")
        return prev.filter(id => id !== itemId)
      } else {
        toast.success("Added to favourites ❤️")
        return [...prev, itemId]
      }
    })
  }

  // ── Coupon Codes ─────────────────────────
  const COUPONS = {
    "CRAVIO10": { type: "percent", value: 10, desc: "10% off" },
    "WELCOME20": { type: "percent", value: 20, desc: "20% off" },
    "FIRST50": { type: "flat", value: 50, desc: "₹50 flat off", oneTime: true },
  }

  const applyCoupon = (code) => {
    if (couponApplied) {
      toast.error("Coupon already applied!")
      return
    }

    const trimmed = code.trim().toUpperCase()
    const coupon = COUPONS[trimmed]

    if (!coupon) {
      toast.error("Invalid coupon code!")
      return
    }

    // Check one-time use coupons
    if (coupon.oneTime) {
      const usedCoupons = JSON.parse(localStorage.getItem("usedCoupons") || "[]")
      if (usedCoupons.includes(trimmed)) {
        toast.error(`${trimmed} can only be used once! 🚫`)
        return
      }
    }

    const subtotal = getTotalCartAmount()

    if (subtotal === 0) {
      toast.error("Add items to cart first!")
      return
    }

    const discountVal = coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value 

    setDiscount(discountVal)
    setCouponCode(trimmed)
    setCouponApplied(true)
    toast.success(`🎉 Coupon applied! You save ₹${discountVal}`)
  }

  const removeCoupon = () => {
    setDiscount(0)
    setCouponCode("")
    setCouponApplied(false)
    toast.info("Coupon removed")
  }

  // Call after successful payment to mark one-time coupons as used
  const markCouponUsed = () => {
    if (couponCode) {
      const coupon = COUPONS[couponCode]
      if (coupon && coupon.oneTime) {
        const used = JSON.parse(localStorage.getItem("usedCoupons") || "[]")
        if (!used.includes(couponCode)) {
          localStorage.setItem("usedCoupons", JSON.stringify([...used, couponCode]))
        }
      }
    }
    // Always clear coupon state after payment
    removeCoupon()
  }

  // ── On mount ─────────────────────────────
  useEffect(() => {
    async function init() {
      await fetchFoodList()
      const savedToken = localStorage.getItem("token")
      if (savedToken) {
        setToken(savedToken)
        await loadCartData(savedToken)
      }
    }
    init()
  }, [])

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    favourites,
    toggleFavourite,
    discount,
    couponCode,
    couponApplied,
    applyCoupon,
    removeCoupon,
    markCouponUsed,
  }

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreContextProvider