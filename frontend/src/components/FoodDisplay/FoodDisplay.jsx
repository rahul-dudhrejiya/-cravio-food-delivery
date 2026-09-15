import { useContext, useState, useMemo } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ category, search, onFoodClick }) => {

    const { food_list } = useContext(StoreContext);
    const [sort, setSort] = useState("default")

    // Memoize filtering and sorting to avoid recalculating on every re-render
    const filtered = useMemo(() => {
        return food_list
            .filter(item => {
                const matchCategory = category === "All" || category === item.category
                const searchLower = search.toLowerCase().trim()
                const matchSearch = search === "" ||
                    item.name.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower) ||
                    item.category.toLowerCase().includes(searchLower) ||
                    searchLower.split(' ').every(word => 
                        item.name.toLowerCase().includes(word) ||
                        item.description.toLowerCase().includes(word)
                    )
                return matchCategory && matchSearch
            })
            .sort((a, b) => {
                if (sort === "low-high") return a.price - b.price
                if (sort === "high-low") return b.price - a.price
                return 0
            })
    }, [food_list, category, search, sort])

    // Show spinner while food is loading
    if (food_list.length === 0) {
        return (
            <div className="food-loading">
                <div className="spinner"></div>
                <p>Loading delicious food...</p>
            </div>
        )
    }

    return (
        <div className='food-display' id='food-display'>
            <div className="food-display-header">
                <h2>
                    {search
                        ? `Results for "${search}"`
                        : category === "All" ? "Top Dishes Near You" : category
                    }
                </h2>

                <div className="food-display-controls">
                    <span className="food-display-count">
                        {filtered.length} item{filtered.length !== 1 ? 's' : ''}
                    </span>

                    {/* ── Sort Dropdown ── */}
                    <select
                        className="sort-select"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="default">Sort By</option>
                        <option value="low-high">Price: Low to High</option>
                        <option value="high-low">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {filtered.length > 0 ? (
                <div className='food-display-list'>
                    {filtered.map((item) => (
                        <FoodItem
                            key={item._id}
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            image={item.image}
                            price={item.price}
                            onFoodClick={onFoodClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="food-display-empty">
                    <p>🍽️</p>
                    <h3>No items found</h3>
                    <p>Try a different search or category!</p>
                </div>
            )}
        </div>
    )

}

export default FoodDisplay