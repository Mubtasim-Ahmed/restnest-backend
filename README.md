# RentNest - Backend API 🏠

A comprehensive rental property marketplace backend API built with Node.js, Express, and MongoDB.

---

## 📋 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **Validation**: Joi
- **Payments**: Stripe & SSLCommerz
- **Middleware**: CORS, bodyParser, express-validator
- **Deployment**: Can be deployed on Heroku, Render, or other Node.js hosting

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe & SSLCommerz accounts (optional, for payments)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd RentNest

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configurations

# Run development server
npm run dev

# Run production server
npm start
```

### Environment Variables

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rentnest
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Stripe
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password

# Node Environment
NODE_ENV=development
```

---

## 📁 Project Structure

```
RentNest/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── constants.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   ├── rentalController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   ├── categoryController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── RentalRequest.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── propertyRoutes.js
│   │   ├── rentalRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── stripeService.js
│   │   └── sslcommerzService.js
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (RBAC)
- Three roles: Tenant, Landlord, Admin
- Token expires after 7 days (configurable)

---

## 💳 Payment Integration

- **Stripe**: For international payments
- **SSLCommerz**: For local payments (Bangladesh, India, etc.)
- Payment status tracking: pending, completed, failed

---

## 📊 Database Schema

See `src/models/` for detailed schema definitions.

---

## 🛣️ API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/properties/*` - Property listing endpoints
- `/api/rentals/*` - Rental request endpoints
- `/api/payments/*` - Payment endpoints
- `/api/reviews/*` - Review endpoints
- `/api/categories/*` - Category endpoints
- `/api/admin/*` - Admin-only endpoints

---

## 📝 Features

✅ User registration and authentication
✅ Property listings with search and filtering
✅ Rental request management
✅ Payment processing (Stripe & SSLCommerz)
✅ Payment history tracking
✅ Review system
✅ Admin dashboard & user management
✅ Role-based access control

---

## 🤝 Contributing

Pull requests are welcome!

---

## 📄 License

MIT License
