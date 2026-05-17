import { useContext, useState } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import './Profile.css'

const Profile = () => {
    const { token, setToken, } = useContext(StoreContext)
    const navigate = useNavigate()

    // Fake user data — in real app fetch from /api/user/profile
    const [user] = useState({
        name: localStorage.getItem("userName") || "Cravio User",
        email: localStorage.getItem("userEmail") || "user@email.com"
    })

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("userName")
        localStorage.removeItem("userEmail")
        setToken("")
        navigate("/")
    }

    if (!token) {
        navigate("/")
        return null
    }

    return (
        <div className="profile">

            {/* ── Profile Header ── */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <span className='profile-badge'>🌿 Pure Veg Lover</span>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="profile-actions">

                <div className="profile-card" onClick={() => navigate('/myorders')}>
                    <span className='profile-card-icon'>📦</span>
                    <div>
                        <h4>My Orders</h4>
                        <p>View all your past orders</p>
                    </div>
                    <span className='arrow'>→</span>
                </div>

                <div className="profile-card" onClick={() => navigate('/cart')}>
                    <span className='profile-card-icon'>🛒</span>
                    <div>
                        <h4>My Cart</h4>
                        <p>View items in your cart</p>
                    </div>
                    <span className='arrow'>→</span>
                </div>

                <div className="profile-card" onClick={() => navigate('/')}>
                    <span className='profile-card-icon'>🍛</span>
                    <div>
                        <h4>Browse Menu</h4>
                        <p>Explore our pure veg menu</p>
                    </div>
                    <span className="arrow">→</span>
                </div>

            </div>

            {/* ── App Info ── */}
            <div className="profile-about">
                <h3>About Cravio</h3>
                <p>Pure veg food delivery app built with MERN Stack + Razorpay + Cloudinary</p>
                <div className="profile-tech-stack">
                    <span>React.js</span>
                    <span>Node.js</span>
                    <span>MongoDB</span>
                    <span>Razorpay</span>
                    <span>Cloudinary</span>
                </div>
            </div>

            {/* ── Logout Button ── */}
            <button className="profile-logout" onClick={logout}>
                Logout →
            </button>

        </div>
    )
}

export default Profile