# 🍛 Cravio — Pure Veg Food Delivery App

> Order Pure Veg Food. Fast. Fresh. Delivered.

A full-stack pure veg food delivery web application built with
MERN Stack featuring AI-powered food recommendations,
Razorpay payment gateway, and Cloudinary image management.

---

## 🔗 Live Demo

| App | Link |
|---|---|
| 🖥️ Frontend | https://cravio.vercel.app |
| 🛠️ Admin Panel | https://cravio-admin.vercel.app |
| ⚙️ Backend API | https://cravio-api.onrender.com |

---

## 📸 Screenshots

> Add your screenshots here after deployment

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 19, Context API, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT + bcrypt |
| Payment | Razorpay |
| Image Storage | Cloudinary |
| AI Feature | Google Gemini API |
| Deployment | Vercel + Render |

---

## ✨ Features

### User Features
- 🔐 Register and Login with JWT authentication
- 🍛 Browse 24+ pure veg food items in 8 categories
- 🔍 Real-time search with smart suggestions
- 🔤 Filter by category + sort by price
- ❤️ Favourites / Wishlist system
- 🛒 Add to cart with quantity management
- 🎟️ Coupon code system (CRAVIO10, WELCOME20, FIRST50)
- 💳 Razorpay payment gateway integration
- 📦 Order tracking with status progress bar
- 🤖 AI-powered food recommendations
- 🌙 Dark mode with localStorage persistence
- 📱 Fully responsive design

### Admin Features
- ➕ Add food items with image upload (Cloudinary)
- 📋 View and delete food listings
- 📦 View all customer orders
- 🔄 Update order delivery status

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Razorpay account
- Cloudinary account

### Backend Setup
```bash
cd backend
npm install
# Create .env file (see Environment Variables section)
npm run server
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file
npm run dev
```

### Admin Setup
```bash
cd admin
npm install
npm run dev
```

---

## 🔐 Environment Variables

### backend/.env

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key

### frontend/.env

VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx

---

## 🎟️ Test Coupon Codes

| Code | Discount | Usage |
|---|---|---|
| CRAVIO10 | 10% off | Unlimited |
| WELCOME20 | 20% off | Unlimited |
| FIRST50 | ₹50 flat off | One time only |

---

## 💳 Test Payment (Razorpay)

Card Number : 5267 3181 8797 5449
Expiry      : 02/26
CVV         : 123
OTP         : use real OTP on your number

---

## 📁 Project Structure

Food-Del MERN/
├── frontend/          # React.js user app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── assets/
│   └── package.json
│
├── admin/             # React.js admin panel
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
│
└── backend/           # Node.js + Express API
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
└── server.js

---

## 👨‍💻 Developer

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Email: your@email.com

---

## 📄 License

MIT License — feel free to use this project for learning!