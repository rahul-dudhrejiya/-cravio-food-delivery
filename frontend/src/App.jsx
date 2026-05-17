/* ============================================================
   FILE: frontend/src/App.jsx
   CHANGE: Added import for App.css, cleaned conditional render
   ============================================================ */

import { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import './App.css'
import Profile from './pages/Profile/Profile'
import BackToTop from './components/BackToTop/BackToTop'
import AiRecommend from './components/AiRecommend/AiRecommend'


const App = () => {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
        <Footer />
        <AiRecommend />
        <BackToTop />
      </div>
    </>
  )
}

export default App