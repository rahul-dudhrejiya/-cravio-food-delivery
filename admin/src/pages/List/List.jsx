import { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useCallback } from 'react'

const List = ({ url }) => {

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

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
    } finally {
      setLoading(false)
    }
  }, [url])

  const removeFood = async (item) => {
    if (!item || !item._id) return
    const confirmed = window.confirm(`Are you sure you want to delete "${item.name}"?\nThis will permanently remove the item from the menu and cloud storage.`)
    if (!confirmed) return

    setDeletingId(item._id)
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: item._id })
      if (response.data.success) {
        toast.success(response.data.message || `Deleted "${item.name}"`)
        await fetchList()
      } else {
        toast.error(response.data.message || "Error removing item")
      }
    } catch (error) {
      toast.error("Could not remove item")
      console.log(error)
    } finally {
      setDeletingId(null)
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

        {loading ? (
          <div className="list-empty">Loading food items...</div>
        ) : list.length === 0 ? (
          <div className="list-empty">No food items added yet.</div>
        ) : (
          list.map((item) => (
            <div key={item._id} className='list-table-format list-table-row'>

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
                onClick={() => deletingId !== item._id && removeFood(item)}
                className={`list-delete ${deletingId === item._id ? 'deleting' : ''}`}
                style={{ cursor: deletingId === item._id ? 'not-allowed' : 'pointer', opacity: deletingId === item._id ? 0.4 : 1 }}
                title="Delete item"
              >
                {deletingId === item._id ? "⏳" : "✕"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default List