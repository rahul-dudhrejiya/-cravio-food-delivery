import { useContext } from 'react'
import './FoodDetail.css'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'

const FoodDetail = ({ food, onClose }) => {

    const { cartItems, addToCart, removeFromCart } = useContext(StoreContext)

    if (!food) return null

    return (
        // Clicking outside closes the modal
        <div className="food-detail-overlay" onClick={onClose}>
            <div
                className="food-detail-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button className="food-detail-close" onClick={onClose}>✕</button>

                {/* Food Image */}
                <div className="food-detail-img">
                    <img src={food.image} alt={food.name} />
                    <span className="food-detail-badge">🌿 Pure Veg</span>
                </div>

                {/* Food Info */}
                <div className="food-detail-info">
                    <div className="food-detail-top">
                        <h2>{food.name}</h2>
                        <span className="food-detail-category">{food.category}</span>
                    </div>

                    {/* Rating */}
                    <div className="food-detail-rating">
                        <img src={assets.rating_starts} alt="rating" />
                        <span>4.5 (200+ reviews)</span>
                    </div>

                    {/* Description */}
                    <p className="food-detail-desc">{food.description}</p>

                    {/* Price + Cart */}
                    <div className="food-detail-bottom">
                        <p className="food-detail-price">₹{food.price}</p>

                        {!cartItems[food._id]
                            ? <button
                                className="food-detail-add"
                                onClick={() => addToCart(food._id)}
                            >
                                Add to Cart +
                            </button>
                            : <div className="food-detail-counter">
                                <button onClick={() => removeFromCart(food._id)}>−</button>
                                <span>{cartItems[food._id]}</span>
                                <button onClick={() => addToCart(food._id)}>+</button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FoodDetail