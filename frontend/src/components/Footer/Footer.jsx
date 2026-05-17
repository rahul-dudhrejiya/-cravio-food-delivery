import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">

        <div className="footer-content-left">
          <img className='footer-logo' src={assets.logo} alt="Cravio" />
          <p>
            Cravio delivers the freshest pure veg food right to your doorstep.
            Quality ingredients, great taste, fast delivery — every time.
          </p>
          <div className="footer-social-icons">
            <a href="#" className="social-link">📘 Facebook</a>
            <a href="#" className="social-link">🐦 Twitter</a>
            <a href="#" className="social-link">💼 LinkedIn</a>
          </div>
        </div>

        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+91-98765-43210</li>
            <li>contact@cravio.com</li>
          </ul>
        </div>

      </div>
      <hr />
      <p className="footer-copyright">Copyright 2026 © Cravio.com — All Rights Reserved.</p>
    </div>
  )
}

export default Footer