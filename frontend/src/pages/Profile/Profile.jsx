import { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import './Profile.css'

const Profile = () => {
    const { token, logout, url } = useContext(StoreContext)
    const navigate = useNavigate()

    const [user, setUser] = useState({
        name: localStorage.getItem("userName") || "Cravio User",
        email: localStorage.getItem("userEmail") || "user@email.com",
        role: "user",
        createdAt: null
    })

    // Edit Name States
    const [editNameOpen, setEditNameOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [isSavingName, setIsSavingName] = useState(false)

    // Change Password States
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    useEffect(() => {
        if (!token) return
        const fetchProfile = async () => {
            try {
                const res = await axios.get(url + "/api/user/profile", { headers: { token } })
                if (res.data.success && res.data.user) {
                    const u = res.data.user
                    setUser({
                        name: u.name,
                        email: u.email,
                        role: u.role || "user",
                        createdAt: u.createdAt
                    })
                    setNewName(u.name)
                    localStorage.setItem("userName", u.name)
                    localStorage.setItem("userEmail", u.email)
                }
            } catch (err) {
                console.log("Error fetching profile:", err)
            }
        }
        fetchProfile()
    }, [token, url])

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    if (!token) {
        navigate("/")
        return null
    }

    // ── Update Profile Name ────────────────────────
    const handleUpdateName = async (e) => {
        e.preventDefault()
        if (!newName.trim() || newName.trim().length < 2) {
            toast.error("Name must be at least 2 characters long")
            return
        }

        setIsSavingName(true)
        try {
            const res = await axios.put(
                url + "/api/user/profile",
                { name: newName.trim() },
                { headers: { token } }
            )
            if (res.data.success) {
                setUser(prev => ({ ...prev, name: res.data.user.name }))
                localStorage.setItem("userName", res.data.user.name)
                toast.success("Name updated successfully! 🎉")
                setEditNameOpen(false)
            } else {
                toast.error(res.data.message || "Failed to update name")
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Error updating profile"
            toast.error(msg)
        } finally {
            setIsSavingName(false)
        }
    }

    // ── Change Password ────────────────────────────
    const handleChangePassword = async (e) => {
        e.preventDefault()
        const { currentPassword, newPassword, confirmPassword } = passwords

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields")
            return
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long")
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }

        setIsChangingPassword(true)
        try {
            const res = await axios.post(
                url + "/api/user/change-password",
                { currentPassword, newPassword },
                { headers: { token } }
            )
            if (res.data.success) {
                toast.success("Password changed successfully! 🔒")
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
                setChangePasswordOpen(false)
            } else {
                toast.error(res.data.message || "Failed to change password")
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Error changing password"
            toast.error(msg)
        } finally {
            setIsChangingPassword(false)
        }
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
                    <div className="profile-tags">
                        <span className='profile-badge'>
                            {user.role === 'admin' ? '🛡️ Administrator' : '🌿 Pure Veg Lover'}
                        </span>
                        {user.createdAt && (
                            <span className='profile-join-date'>
                                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Account Settings / Modals ── */}
            <div className="profile-management-cards">
                {/* Edit Name Trigger */}
                <div className="profile-mgmt-item">
                    <div>
                        <h4>Display Name</h4>
                        <p>{user.name}</p>
                    </div>
                    <button
                        className="profile-mgmt-btn"
                        onClick={() => setEditNameOpen(!editNameOpen)}
                    >
                        {editNameOpen ? "Cancel" : "Edit Name ✏️"}
                    </button>
                </div>

                {editNameOpen && (
                    <form className="profile-edit-form" onSubmit={handleUpdateName}>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                        <button type="submit" disabled={isSavingName}>
                            {isSavingName ? "Saving..." : "Save Name"}
                        </button>
                    </form>
                )}

                {/* Change Password Trigger */}
                <div className="profile-mgmt-item">
                    <div>
                        <h4>Security & Password</h4>
                        <p>Change your account password</p>
                    </div>
                    <button
                        className="profile-mgmt-btn"
                        onClick={() => setChangePasswordOpen(!changePasswordOpen)}
                    >
                        {changePasswordOpen ? "Cancel" : "Change Password 🔒"}
                    </button>
                </div>

                {changePasswordOpen && (
                    <form className="profile-edit-form password-form" onSubmit={handleChangePassword}>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                        />
                        <input
                            type="password"
                            placeholder="New Password (min 8 characters)"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                        />
                        <button type="submit" disabled={isChangingPassword}>
                            {isChangingPassword ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                )}
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
                <p>Pure veg food delivery app built with MERN Stack + Razorpay + Cloudinary + Gemini AI</p>
                <div className="profile-tech-stack">
                    <span>React.js</span>
                    <span>Node.js</span>
                    <span>MongoDB</span>
                    <span>Razorpay</span>
                    <span>Cloudinary</span>
                </div>
            </div>

            {/* ── Logout Button ── */}
            <button className="profile-logout" onClick={handleLogout}>
                Logout →
            </button>

        </div>
    )
}

export default Profile