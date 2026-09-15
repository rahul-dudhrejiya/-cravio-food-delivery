import { useContext, memo } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const FoodItem = ({ id, name, price, description, image, onFoodClick }) => {

    const { cartItems, addToCart, removeFromCart, favourites, toggleFavourite } = useContext(StoreContext)

    return (
        <div className='food-item'>
            <div className="food-item-img-container"
                /* Click image area to open detail popup */
                onClick={() => onFoodClick &&
                    onFoodClick({ _id: id, name, price, description, image })
                }
                style={{ cursor: 'pointer' }}
            >
                <img
                    className='food-item-image'
                    src={image}
                    alt={name}
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200x200?text=Food"
                    }}
                />

                <span className="food-item-badge">🌿 Pure Veg</span>
                <span
                    className='fav-btn'
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleFavourite(id)
                    }}
                >
                    {favourites.includes(id) ? "❤️" : "🤍"}
                </span>

                {!cartItems[id]
                    ? <img
                        className='add'
                        onClick={(e) => {
                            e.stopPropagation()
                            addToCart(id)
                        }}
                        src={assets.add_icon_white}
                        alt='Add to cart'
                    />
                    : <div
                        className='food-item-counter'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            onClick={(e) => {
                                e.stopPropagation()
                                removeFromCart(id)
                            }}
                            src={assets.remove_icon_red}
                            alt='Remove'
                        />
                        <p>{cartItems[id]}</p>
                        <img
                            onClick={(e) => {
                                e.stopPropagation()
                                addToCart(id)
                            }}
                            src={assets.add_icon_green}
                            alt='Add'
                        />
                    </div>
                }
            </div>

            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <img src={assets.rating_starts} alt="rating" />
                </div>
                <p className='food-item-desc'>{description}</p>
                <p className='food-item-price'>₹{price}</p>
            </div>
        </div>
    )
}

export default memo(FoodItem)