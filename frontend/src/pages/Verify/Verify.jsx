import { useEffect } from 'react'
import "./Verify.css"
import { useNavigate } from 'react-router-dom'

const Verify = () => {
    const navigate = useNavigate()

    useEffect(() => {
        // Razorpay handles verification directly in the PlaceOrder modal handler callback.
        // If a user navigates to /verify, safely route them to their orders page.
        navigate("/myorders", { replace: true })
    }, [navigate])

    return (
        <div className='verify'>
            <div className="spinner"></div>
        </div>
    )
}

export default Verify