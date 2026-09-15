/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

  const [cartItems, setCartItems] = useState({})
  const [token, setToken] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [food_list, setFoodList] = useState([])
  const [favourites, setFavourites] = useState([])
  const [discount, setDiscount] = useState(0)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)

  const url = import.meta.env.VITE_API_URL || "https://cravio-backend-ss5u.onrender.com"

  // ── Centralized Logout ───────────────────
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    setToken("")
    setCartItems({})
    setDiscount(0)
    setCouponCode("")
    setCouponApplied(false)
  }

  // ── Auto-logout on 401 Token Expiration ──
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401 && token) {
          logout()
          toast.info("Session expired. Please sign in again.")
        }
        return Promise.reject(error)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [token])

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

  // ── Coupon Validation (Server Authoritative) ─
  const applyCoupon = async (code) => {
    if (couponApplied) {
      toast.error("A coupon is already applied!")
      return
    }

    const trimmed = code ? code.trim().toUpperCase() : ""
    if (!trimmed) {
      toast.error("Please enter a coupon code!")
      return
    }

    const subtotal = getTotalCartAmount()
    if (subtotal === 0) {
      toast.error("Add items to cart first!")
      return
    }

    if (!token) {
      toast.error("Please log in to apply coupons!")
      return
    }

    try {
      const response = await axios.post(
        url + "/api/order/validate-coupon",
        { couponCode: trimmed, subtotal },
        { headers: { token } }
      )

      if (response.data.success) {
        setDiscount(response.data.discount)
        setCouponCode(response.data.couponCode)
        setCouponApplied(true)
        toast.success(`🎉 ${response.data.couponCode} applied! You save ₹${response.data.discount}`)
      } else {
        toast.error(response.data.message || "Invalid coupon")
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to validate coupon"
      toast.error(msg)
    }
  }

  const removeCoupon = () => {
    setDiscount(0)
    setCouponCode("")
    setCouponApplied(false)
    toast.info("Coupon removed")
  }

  // Clear coupon state after successful checkout (server records usage in DB)
  const markCouponUsed = () => {
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
    showLogin,
    setShowLogin,
    logout,
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