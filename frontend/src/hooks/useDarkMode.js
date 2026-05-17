/* This hook handles dark mode logic and saves preference */


import { useState, useEffect } from 'react'

const useDarkMode = () => {

    // Check if user previously chose dark mode
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("darkMode") === "true"
    })

    useEffect(() => {
        if (isDark) {
            document.body.classList.add("dark")
        } else {
            document.body.classList.remove("dark")
        }
        // Save preference so it remembers after refresh
        localStorage.setItem("darkMode", isDark)
    }, [isDark])

    const toggleDark = () => setIsDark(prev => !prev)

    return { isDark, toggleDark }
}

export default useDarkMode