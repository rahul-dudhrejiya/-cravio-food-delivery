// ============================================
//   CRAVIO - Pure Veg Food Delivery App
//   assets.js - Matches your exact file names
// ============================================

// ── LOGO & HERO ───────────────────────────
import logo from './logo.png'
import hero from './hero.png'
import header_img from './header_img.jpg'

// ── APP STORE ICONS ───────────────────────
import app_store from './app_store.png'
import play_store from './play_store.png'

// ── ICONS ─────────────────────────────────
// Download these from Flaticon.com (free)
// Save each one with exact name below in .png
import search_icon from './search_icon.png'
import basket_icon from './basket_icon.png'
import profile_icon from './profile_icon.png'
import cross_icon from './cross_icon.png'
import selector_icon from './selector_icon.png'
import rating_starts from './rating_starts.png'
import bag_icon from './bag_icon.png'
import logout_icon from './logout_icon.png'
import parcel_icon from './parcel_icon.png'
import add_icon_white from './add_icon_white.png'
import add_icon_green from './add_icon_green.png'
import remove_icon_red from './remove_icon_red.png'

// ── CATEGORY IMAGES ───────────────────────
// ✅ Matches your exact file names in VSCode
import cat_biryani from './cat_veg_biryani.jpg'   // your file is cat_veg_biryani.jpg
import cat_paneer from './cat_paneer.jpg'
import cat_roti from './cat_roti.jpg'
import cat_snacks from './cat_snacks.jpg'
import cat_dal from './cat_dal.jpg'
import cat_desserts from './cat_desserts.jpg'
import cat_drinks from './cat_drinks.jpg'
import cat_salad from './cat_salad.jpg'

// ── FOOD ITEM IMAGES ──────────────────────
// ✅ All .jpg - matches your VSCode files
import food_1 from './food_1.jpg'
import food_2 from './food_2.jpg'
import food_3 from './food_3.jpg'
import food_4 from './food_4.jpg'
import food_5 from './food_5.jpg'
import food_6 from './food_6.jpg'
import food_7 from './food_7.jpg'
import food_8 from './food_8.jpg'
import food_9 from './food_9.jpg'
import food_10 from './food_10.jpg'
import food_11 from './food_11.jpg'
import food_12 from './food_12.jpg'
import food_13 from './food_13.jpg'
import food_14 from './food_14.jpg'
import food_15 from './food_15.jpg'
import food_16 from './food_16.jpg'
import food_17 from './food_17.jpg'
import food_18 from './food_18.jpg'
import food_19 from './food_19.jpg'
import food_20 from './food_20.jpg'
import food_21 from './food_21.jpg'
import food_22 from './food_22.jpg'
import food_23 from './food_23.jpg'
import food_24 from './food_24.jpg'

// ============================================
//   EXPORT ASSETS OBJECT
// ============================================
export const assets = {
  logo,
  hero,
  header_img,
  app_store,
  play_store,
  search_icon,
  basket_icon,
  profile_icon,
  cross_icon,
  selector_icon,
  rating_starts,
  bag_icon,
  logout_icon,
  parcel_icon,
  add_icon_white,
  add_icon_green,
  remove_icon_red,
}

// ============================================
//   FOOD CATEGORIES (8 Pure Veg)
// ============================================
export const menu_list = [
  { menu_name: "Biryani & Rice",    menu_image: cat_biryani  },
  { menu_name: "Paneer Dishes",     menu_image: cat_paneer   },
  { menu_name: "Roti & Paratha",    menu_image: cat_roti     },
  { menu_name: "Snacks & Starters", menu_image: cat_snacks   },
  { menu_name: "Dal & Sabzi",       menu_image: cat_dal      },
  { menu_name: "Desserts & Sweets", menu_image: cat_desserts },
  { menu_name: "Drinks & Juices",   menu_image: cat_drinks   },
  { menu_name: "Salads",            menu_image: cat_salad    },
]

// ============================================
//   FOOD LIST (24 Pure Veg Items)
// ============================================
export const food_list = [

  // ── 1. Biryani & Rice ───────────────────
  {
    _id: "1",
    name: "Veg Biryani",
    image: food_1,
    price: 180,
    rating: 4.5,
    ratings_count: "(234)",
    category: "Biryani & Rice",
    description: "Aromatic basmati rice cooked with fresh vegetables and whole spices. A royal feast in every bite."
  },
  {
    _id: "2",
    name: "Jeera Rice",
    image: food_2,
    price: 120,
    rating: 4.2,
    ratings_count: "(189)",
    category: "Biryani & Rice",
    description: "Light and fluffy basmati rice tempered with cumin seeds, ghee and fresh coriander."
  },
  {
    _id: "3",
    name: "Veg Pulao",
    image: food_3,
    price: 150,
    rating: 4.3,
    ratings_count: "(156)",
    category: "Biryani & Rice",
    description: "Fragrant rice cooked with seasonal vegetables, cashews and mild spices. Simple and delicious."
  },

  // ── 2. Paneer Dishes ────────────────────
  {
    _id: "4",
    name: "Paneer Butter Masala",
    image: food_4,
    price: 220,
    rating: 4.7,
    ratings_count: "(412)",
    category: "Paneer Dishes",
    description: "Soft paneer cubes in a rich, creamy tomato-based gravy. A classic favourite everyone loves."
  },
  {
    _id: "5",
    name: "Palak Paneer",
    image: food_5,
    price: 200,
    rating: 4.5,
    ratings_count: "(298)",
    category: "Paneer Dishes",
    description: "Fresh cottage cheese in a smooth, spiced spinach gravy. Healthy, wholesome and flavourful."
  },
  {
    _id: "6",
    name: "Paneer Tikka",
    image: food_6,
    price: 250,
    rating: 4.8,
    ratings_count: "(367)",
    category: "Paneer Dishes",
    description: "Grilled marinated paneer with bell peppers and onions. Smoky, spicy and absolutely irresistible."
  },

  // ── 3. Roti & Paratha ───────────────────
  {
    _id: "7",
    name: "Butter Naan",
    image: food_7,
    price: 50,
    rating: 4.4,
    ratings_count: "(521)",
    category: "Roti & Paratha",
    description: "Soft, fluffy tandoor-baked bread brushed with butter. Best paired with any curry."
  },
  {
    _id: "8",
    name: "Aloo Paratha",
    image: food_8,
    price: 80,
    rating: 4.6,
    ratings_count: "(445)",
    category: "Roti & Paratha",
    description: "Whole wheat flatbread stuffed with spiced mashed potatoes. Served with curd and pickle."
  },
  {
    _id: "9",
    name: "Missi Roti",
    image: food_9,
    price: 60,
    rating: 4.1,
    ratings_count: "(178)",
    category: "Roti & Paratha",
    description: "Punjabi-style flatbread made with gram flour and spices. Rustic, nutritious and filling."
  },

  // ── 4. Snacks & Starters ────────────────
  {
    _id: "10",
    name: "Samosa (2 pcs)",
    image: food_10,
    price: 40,
    rating: 4.6,
    ratings_count: "(632)",
    category: "Snacks & Starters",
    description: "Crispy golden pastry filled with spiced potatoes and peas. India's most loved snack!"
  },
  {
    _id: "11",
    name: "Veg Momos (6 pcs)",
    image: food_11,
    price: 120,
    rating: 4.7,
    ratings_count: "(589)",
    category: "Snacks & Starters",
    description: "Steamed dumplings stuffed with spiced vegetables, served with fiery red chutney."
  },
  {
    _id: "12",
    name: "Pav Bhaji",
    image: food_12,
    price: 110,
    rating: 4.8,
    ratings_count: "(701)",
    category: "Snacks & Starters",
    description: "Spiced mashed vegetable curry served with buttered toasted pav buns. Mumbai street magic!"
  },

  // ── 5. Dal & Sabzi ──────────────────────
  {
    _id: "13",
    name: "Dal Makhani",
    image: food_13,
    price: 180,
    rating: 4.7,
    ratings_count: "(388)",
    category: "Dal & Sabzi",
    description: "Slow-cooked black lentils in a buttery, creamy tomato gravy. Rich, comforting and indulgent."
  },
  {
    _id: "14",
    name: "Aloo Gobi",
    image: food_14,
    price: 150,
    rating: 4.3,
    ratings_count: "(267)",
    category: "Dal & Sabzi",
    description: "Dry-spiced potatoes and cauliflower cooked with turmeric and coriander. A homestyle classic."
  },
  {
    _id: "15",
    name: "Mix Veg Curry",
    image: food_15,
    price: 160,
    rating: 4.4,
    ratings_count: "(312)",
    category: "Dal & Sabzi",
    description: "Seasonal vegetables cooked in a flavourful onion-tomato masala. Nutritious and delicious."
  },

  // ── 6. Desserts & Sweets ────────────────
  {
    _id: "16",
    name: "Gulab Jamun (2 pcs)",
    image: food_16,
    price: 70,
    rating: 4.8,
    ratings_count: "(556)",
    category: "Desserts & Sweets",
    description: "Soft milk-solid dumplings soaked in rose-flavoured sugar syrup. Pure melt-in-mouth bliss."
  },
  {
    _id: "17",
    name: "Rice Kheer",
    image: food_17,
    price: 90,
    rating: 4.5,
    ratings_count: "(334)",
    category: "Desserts & Sweets",
    description: "Creamy rice pudding slow-cooked in milk with saffron, cardamom and dry fruits."
  },
  {
    _id: "18",
    name: "Jalebi (100g)",
    image: food_18,
    price: 60,
    rating: 4.6,
    ratings_count: "(478)",
    category: "Desserts & Sweets",
    description: "Crispy spiral sweets soaked in sugar syrup. Hot jalebis are an experience in themselves!"
  },

  // ── 7. Drinks & Juices ──────────────────
  {
    _id: "19",
    name: "Mango Lassi",
    image: food_19,
    price: 80,
    rating: 4.8,
    ratings_count: "(423)",
    category: "Drinks & Juices",
    description: "Thick, creamy yogurt blended with fresh Alphonso mango pulp. Summer in a glass!"
  },
  {
    _id: "20",
    name: "Fresh Lime Soda",
    image: food_20,
    price: 50,
    rating: 4.4,
    ratings_count: "(289)",
    category: "Drinks & Juices",
    description: "Chilled soda with freshly squeezed lime, black salt and mint. Instantly refreshing."
  },
  {
    _id: "21",
    name: "Rose Sharbat",
    image: food_21,
    price: 60,
    rating: 4.3,
    ratings_count: "(198)",
    category: "Drinks & Juices",
    description: "Traditional rose-flavoured cold drink with basil seeds and milk. A desi favourite."
  },

  // ── 8. Salads ───────────────────────────
  {
    _id: "22",
    name: "Kachumber Salad",
    image: food_22,
    price: 80,
    rating: 4.2,
    ratings_count: "(145)",
    category: "Salads",
    description: "Diced cucumber, tomato and onion with lemon juice and chaat masala. Fresh and crunchy."
  },
  {
    _id: "23",
    name: "Sprouts Salad",
    image: food_23,
    price: 100,
    rating: 4.5,
    ratings_count: "(212)",
    category: "Salads",
    description: "Protein-packed mixed sprouts tossed with veggies, lemon and spices. Healthy never tasted better."
  },
  {
    _id: "24",
    name: "Fruit Salad",
    image: food_24,
    price: 120,
    rating: 4.6,
    ratings_count: "(267)",
    category: "Salads",
    description: "Fresh seasonal fruits with a hint of chaat masala and honey. Light, refreshing and wholesome."
  },
]