import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'   //{ StoreContext } when we wanted
import { ToastContainer } from 'react-toastify' // this is for search bar
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <StoreContextProvider>
            <ToastContainer position="top-right" autoClose={2000} />
            <App />
        </StoreContextProvider>
    </BrowserRouter>
)