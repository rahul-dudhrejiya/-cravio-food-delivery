import { useState, useContext } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import FoodDetail from '../../components/FoodDetail/FoodDetail'
import { StoreContext } from '../../context/StoreContext'


const Home = () => {

  const [category, setCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [selectedFood, setSelectedFood] = useState(null)  // for product details

  const { food_list } = useContext(StoreContext)

  return (
    <div>
      <Header />
      <ExploreMenu
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
        food_list={food_list}
      />
      <FoodDisplay
        category={category}
        search={search}
        onFoodClick={setSelectedFood}   // ← ADD pass function for product detail
      />
      <AppDownload />
      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetail
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  )
}

export default Home