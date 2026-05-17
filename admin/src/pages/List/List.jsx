import { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useCallback } from 'react'

const List = ({ url }) => {

  const [list, setList] = useState([])

  const fetchList = useCallback (async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`)
      if (response.data.success) {
        setList(response.data.data)
      } else {
        toast.error("Error fetching list")
      }
    } catch (error) {
      toast.error("Could not connect to server")
      console.log(error)
    }
  }, [url])

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error("Error removing item")
      }
    } catch (error) {
      toast.error("Could not remove item")
      console.log(error)
    }
  }

  useEffect(() => {
    (async () => {
      await fetchList()
    })()
  }, [fetchList])

  return (
    <div className='list'>
      <p className='list-title'>All Food Items</p>

      <div className="list-table">
        {/* Header */}
        <div className="list-table-format list-table-header">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>

        {list.length === 0 ? (
          <div className="list-empty">No food items added yet.</div>
        ) : (
          list.map((item, index) => (
            <div key={index} className='list-table-format list-table-row'>

              {/* BUG FIX: item.image is now full Cloudinary URL
                  OLD (wrong): src={`${url}/images/` + item.image}
                  NEW (correct): src={item.image}
                  Cloudinary stores full URL in DB, not just filename */}
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.src = "https://via.placeholder.com/60x60?text=Food"
                }}
              />

              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>₹{item.price}</p>
              <span
                onClick={() => removeFood(item._id)}
                className='list-delete'
                title="Delete item"
              >✕</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default List