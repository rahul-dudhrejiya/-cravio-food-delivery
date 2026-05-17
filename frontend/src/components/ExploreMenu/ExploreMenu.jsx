import { useState } from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({ category, setCategory, search, setSearch, food_list = [] }) => {

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // This comes from Home.jsx — food_list passed as prop
  // We need food_list to make suggestions work
  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)

    // Generate suggestions from food_list
    if (val.length > 1 && food_list.length > 0) {
      const matched = food_list
        .filter(f =>
          f.name.toLowerCase().includes(val.toLowerCase()) ||
          f.category.toLowerCase().includes(val.toLowerCase())
        )
        .slice(0, 5)
        .map(f => ({ name: f.name, category: f.category }))
      setSuggestions(matched)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (e, name) => {
    // BUG FIX: stopPropagation stops click going to category item behind
    e.stopPropagation()
    e.preventDefault()
    setSearch(name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const clearSearch = (e) => {
    e.stopPropagation()
    setSearch("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Close suggestions when clicking outside
  const handleBlur = () => {
    // Small delay so click on suggestion registers first
    setTimeout(() => setShowSuggestions(false), 150)
  }

  return (
    <div className='explore-menu' id='explore-menu'>
      <span className='explore-menu-tag'>Our Menu</span>
      <h1>Explore our Menu</h1>
      <p className='explore-menu-text'>
        Choose from a variety of delicious pure veg dishes.
      </p>

      {/* Search Bar with Suggestions */}
      <div className="search-wrapper">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for food like biryani, samosa..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={handleBlur}
          />
          {search && (
            <span className="search-clear" onClick={clearSearch}>✕</span>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="suggestion-item"
                onMouseDown={(e) => handleSuggestionClick(e, s.name)}
              >
                <span className="suggestion-icon">🔍</span>
                <span className="suggestion-name">{s.name}</span>
                <span className="suggestion-category">{s.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className='explore-menu-list'>
        {menu_list.map((item, index) => (
          <div
            key={index}
            className={`explore-menu-list-item ${category === item.menu_name ? 'active-item' : ''}`}
            onClick={() => setCategory(prev =>
              prev === item.menu_name ? "All" : item.menu_name
            )}
          >
            <img src={item.menu_image} alt={item.menu_name} />
            <p>{item.menu_name}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  )

}

export default ExploreMenu