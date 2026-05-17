import './Header.css'

const Header = () => {
  return (
    <div className='header'>

      {/* 
        WHY we put the image as an <img> tag now instead of CSS background?
        - CSS background-image: transparent PNGs show CHECKERBOARD (your problem!)
        - <img> tag lets us use mask-image to fade it smoothly into the gradient
        - We can control opacity separately
        - Much better control over responsive behavior
      */}
      <img
        className='header-bg-image'
        src='/header_img.png'
        alt='Delicious food'
      />

      <div className="header-contents">

        {/* Small badge — makes it feel premium and professional */}
        <div className="header-badge">
          <span>🌿</span>
          100% Pure Veg · Fresh Daily
        </div>

        {/* Main headline — bold, emotional, memorable */}
        <h2>
          Order Your <span className='highlight'>Favourite</span><br />
          Food Here
        </h2>

        {/* Subtext */}
        <p>
          Choose from a diverse menu of delicious pure veg dishes —
          crafted with care and delivered fresh to your door.
        </p>

        {/* Two buttons — primary action + browse option */}
        <div className="header-btn-group">
          <button
            className='header-btn-primary'
            onClick={() => document.getElementById('explore-menu').scrollIntoView({ behavior: 'smooth' })}>
            Explore Menu →
          </button>
          <button className='header-btn-secondary'>
            <span>▶</span> How it Works
          </button>
        </div>

        {/* Stats — builds trust, looks professional */}
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">24+</span>
            <span className="stat-label">Menu Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">8</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">30 min</span>
            <span className="stat-label">Avg Delivery</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Header