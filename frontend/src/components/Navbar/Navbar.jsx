import { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import useDarkMode from '../../hooks/useDarkMode'


const Navbar = ({ setShowLogin }) => {

    const [menu, setMenu] = useState("home")
    const [mobileOpen, setMobileOpen] = useState(false)
    const { token, setToken, cartItems } = useContext(StoreContext)
    const navigate = useNavigate()
    const { isDark, toggleDark } = useDarkMode()
    const [profileOpen, setProfileOpen] = useState(false)


    const logout = () => {
        localStorage.removeItem("token")
        setToken("")
        navigate("/")
    }

    const closeMenu = () => setMobileOpen(false)

    const totalItems = Object.values(cartItems).reduce((sum, val) => sum + val, 0)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.navbar-profile')) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    return (
        <div className='navbar'>

            {/* Logo */}
            <Link to="/"><img className='navbar-logo' src={assets.logo} alt="Cravio" /></Link>

            {/* Hamburger (mobile only) */}
            <div
                className={`navbar-hamburger ${mobileOpen ? 'open' : ''}`}
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Nav links */}
            <ul className={`navbar-menu ${mobileOpen ? 'mobile-open' : ''}`}>
                <Link to='/' onClick={() => { setMenu("home"); closeMenu() }}
                    className={menu === "home" ? "active" : ""}>Home</Link>

                <a href='#explore-menu' onClick={() => { setMenu("menu"); closeMenu() }}
                    className={menu === "menu" ? "active" : ""}>Menu</a>

                <a href='#app-download' onClick={() => { setMenu("mobile-app"); closeMenu() }}
                    className={menu === "mobile-app" ? "active" : ""}>Mobile App</a>

                <a href='#footer' onClick={() => { setMenu("contact-us"); closeMenu() }}
                    className={menu === "contact-us" ? "active" : ""}>Contact Us</a>
            </ul>

            {/* Right side */}
            <div className="navbar-right">
                <button
                    className="dark-toggle"
                    onClick={toggleDark}
                    title={isDark ? "Switch to Light" : "Switch to Dark"}
                >
                    {isDark ? "☀️" : "🌙"}
                </button>
                <img src={assets.search_icon} alt="search" />

                <div className="navbar-cart-icon">
                    <Link to="/cart">
                        <img src={assets.basket_icon} alt="cart" />
                    </Link>
                    {totalItems > 0 && (
                        <div className="cart-count">{totalItems}</div>
                    )}
                </div>

                {!token
                    ? <button className='navbar-btn' onClick={() => setShowLogin(true)}>Sign In</button>
                    : <div className='navbar-profile'>
                        <img
                            src={assets.profile_icon}
                            alt="profile"
                            onClick={() => setProfileOpen(!profileOpen)}
                        />

                        {profileOpen && (
                            <ul className='nav-profile-dropdown'>
                                <li onClick={() => { navigate('/profile'); setProfileOpen(false) }}>
                                    <span>👤</span>
                                    <p>My Profile</p>
                                </li>
                                <hr />
                                <li onClick={() => { navigate('/myorders'); setProfileOpen(false) }}>
                                    <span>📦</span>
                                    <p>My Orders</p>
                                </li>
                                <hr />
                                <li onClick={() => { logout(); setProfileOpen(false) }}>
                                    <span>🚪</span>
                                    <p>Logout</p>
                                </li>
                            </ul>
                        )}
                    </div>
                }
            </div>
        </div>
    )
}

export default Navbar