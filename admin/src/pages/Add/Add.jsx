import { useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from "axios"
import { toast } from 'react-toastify'

const Add = ({ url }) => {

    const [image, setImage] = useState(false)
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Biryani & Rice"   // default matches first option
    })

    const onChangeHandler = (event) => {
        const { name, value } = event.target
        setData(prev => ({ ...prev, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        if (!image) {
            toast.error("Please upload a food image")
            return
        }

        const formData = new FormData()
        formData.append("name", data.name)
        formData.append("description", data.description)
        formData.append("price", Number(data.price))
        formData.append("category", data.category)
        formData.append("image", image)

        try {
            const response = await axios.post(`${url}/api/food/add`, formData)
            if (response.data.success) {
                setData({ name: "", description: "", price: "", category: "Biryani & Rice" })
                setImage(false)
                toast.success(response.data.message)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error("Error adding food item")
            console.log(error)
        }
    }

    return (
        <div className='add'>
            <form className='add-form' onSubmit={onSubmitHandler}>

                {/* Image Upload */}
                <div className='add-img-upload'>
                    <p>Upload Image</p>
                    <label htmlFor="image" className='add-img-label'>
                        <img
                            src={image ? URL.createObjectURL(image) : assets.upload_area}
                            alt="Upload"
                            className='add-img-preview'
                        />
                        <span>{image ? "Click to change image" : "Click to upload image"}</span>
                    </label>
                    <input
                        onChange={(e) => setImage(e.target.files[0])}
                        type="file" id='image' hidden accept="image/*" required
                    />
                </div>

                {/* Product Name */}
                <div className="add-product-name">
                    <p>Product Name</p>
                    {/* FIXED: added name="name" so onChangeHandler can track it */}
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        name="name"
                        type="text"
                        placeholder='e.g. Paneer Butter Masala'
                        required
                    />
                </div>

                {/* Description */}
                <div className="add-product-description">
                    <p>Product Description</p>
                    <textarea
                        onChange={onChangeHandler}
                        name="description"
                        value={data.description}
                        rows="4"
                        placeholder='Short description of the dish...'
                        required
                    />
                </div>

                {/* Category + Price */}
                <div className="add-category-price">
                    <div className="add-category">
                        <p>Category</p>
                        {/* FIXED: value was data.price → now data.category */}
                        {/* FIXED: all options had empty value="" → now filled */}
                        <select onChange={onChangeHandler} value={data.category} name="category">
                            <option value="Biryani & Rice">Biryani &amp; Rice</option>
                            <option value="Paneer Dishes">Paneer Dishes</option>
                            <option value="Roti & Paratha">Roti &amp; Paratha</option>
                            <option value="Snacks & Starters">Snacks &amp; Starters</option>
                            <option value="Dal & Sabzi">Dal &amp; Sabzi</option>
                            <option value="Desserts & Sweets">Desserts &amp; Sweets</option>
                            <option value="Drinks & Juices">Drinks &amp; Juices</option>
                            <option value="Salads">Salads</option>
                        </select>
                    </div>

                    <div className="add-price">
                        <p>Price (₹)</p>
                        {/* FIXED: was missing name="price" — price was never captured */}
                        <input
                            onChange={onChangeHandler}
                            value={data.price}
                            type="number"
                            name="price"
                            placeholder='e.g. 180'
                            min="1"
                            required
                        />
                    </div>
                </div>

                <button type='submit' className='add-btn'>Add Food Item</button>
            </form>
        </div>
    )
}

export default Add