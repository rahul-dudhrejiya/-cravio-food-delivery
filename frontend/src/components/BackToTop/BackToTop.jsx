import { useState, useEffect } from 'react'
import './BackToTop.css'

const BackToTop = () => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            // Show button after scrolling 400px down
            setVisible(window.scrollY > 400)
        }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!visible) return null

    return (
        <button className="back-to-top" onClick={scrollToTop}>
            ↑
        </button>
    )
}

export default BackToTop