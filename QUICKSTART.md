# RentNest - Quick Start Guide

Get RentNest backend running in 5 minutes!

---

## ⚡ Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB (local or MongoDB Atlas)
- Git

Check your versions:
```bash
node --version
npm --version
```

---

## 🚀 Step 1: Setup Project

### Clone/Download Repository
```bash
cd your-workspace
```

### Install Dependencies
```bash
npm install
```

This installs:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- stripe
- axios
- dotenv
- cors
- nodemailer
- and more...

---

## 🔧 Step 2: Configure Environment

### Create `.env` file

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Update `.env` with Your Configuration

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rentnest
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRE=7d

# Stripe (Get from https://stripe.com)
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# SSLCommerz (Get from https://sslcommerz.com)
SSLCOMMERZ_STORE_ID=test
SSLCOMMERZ_STORE_PASSWORD=test
SSLCOMMERZ_API_URL=https://sandbox.sslcommerz.com

NODE_ENV=development
```

---

## 📦 Step 3: Setup MongoDB

### Option A: Local MongoDB

```bash
# On Windows, MongoDB should be installed and running
# Check if running: mongosh

# If not installed, download from: https://www.mongodb.com/try/download/community
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update MONGODB_URI in .env:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rentnest
```

---

## 🌱 Step 4: Seed Sample Data

Add test data to database:
```bash
npm run seed
```

This creates:
- ✅ Admin user (admin@rentnest.com / admin123456)
- ✅ Landlord user (landlord@rentnest.com / landlord123456)
- ✅ Tenant user (tenant@rentnest.com / tenant123456)
- ✅ Sample properties
- ✅ Property categories

---

## ▶️ Step 5: Start Server

### Development Mode
```bash
npm run dev
```

Server will start on `http://localhost:5000`

You should see:
```
✅ MongoDB Connected: localhost
🚀 RentNest API Server running on port 5000
```

### Production Mode
```bash
npm start
```

---

## ✅ Verify Setup

Open browser and go to:
```
http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "RentNest API is running"
}
```

---

## 🧪 Test API

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Create new request
3. Test login endpoint:

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "tenant@rentnest.com",
  "password": "tenant123456"
}
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Using cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant@rentnest.com",
    "password": "tenant123456"
  }'
```

---

## 📝 Common Commands

### Development
```bash
npm run dev          # Start with hot reload
npm run seed         # Add sample data
```

### Production
```bash
npm start            # Start server
```

### Testing
```bash
npm test             # Run tests (when configured)
```

---

## 🗂️ Project Structure Explained

```
RentNest/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Business logic
│   ├── middleware/   # Request middleware
│   ├── models/       # Database schemas
│   ├── routes/       # API routes
│   ├── utils/        # Helper functions
│   └── app.js        # Express setup
│
├── server.js         # Entry point
├── seed.js           # Sample data
├── package.json      # Dependencies
├── .env              # Environment variables
└── README.md         # Documentation
```

---

## 🔑 Test Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentnest.com | admin123456 |
| Landlord | landlord@rentnest.com | landlord123456 |
| Tenant | tenant@rentnest.com | tenant123456 |

---

## 📚 API Quick Reference

### Authentication
```bash
# Register
POST /api/auth/register

# Login
POST /api/auth/login

# Get current user
GET /api/auth/me
```

### Properties
```bash
# List all properties
GET /api/properties

# Get property details
GET /api/properties/:id

# Create property (Landlord only)
POST /api/properties

# Update property (Landlord only)
PUT /api/properties/:id
```

### Rental Requests
```bash
# Submit request (Tenant only)
POST /api/rentals

# Get my requests (Tenant only)
GET /api/rentals

# Get landlord requests (Landlord only)
GET /api/rentals/landlord/requests

# Approve request (Landlord only)
PATCH /api/rentals/:id/approve

# Reject request (Landlord only)
PATCH /api/rentals/:id/reject
```

### Payments
```bash
# Create Stripe payment
POST /api/payments/stripe/create-intent

# Verify payment
POST /api/payments/stripe/verify

# Get payment history
GET /api/payments
```

### Reviews
```bash
# Create review (Tenant only)
POST /api/reviews

# Get property reviews
GET /api/reviews/property/:propertyId

# Get landlord reviews
GET /api/reviews/landlord/:landlordId
```

### Admin
```bash
# Get all users
GET /api/admin/users

# Ban user
PATCH /api/admin/users/:id/ban

# Dashboard stats
GET /api/admin/statistics
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Windows: MongoDB should auto-start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Change PORT in .env or kill process using port 5000
```bash
# Find process on port 5000
lsof -i :5000

# Kill it
kill -9 <PID>
```

### Invalid Token
```
Error: Invalid token
```
**Solution**: 
1. Make sure you have a valid token from login
2. Include `Authorization: Bearer <token>` header
3. Check token hasn't expired (7 days default)

### Database Error
```
Error: User validation failed
```
**Solution**: Check your request data matches schema requirements

---

## 📖 Next Steps

1. **Read API Documentation**
   - See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

2. **Test Endpoints**
   - Import Postman collection
   - Test all CRUD operations

3. **Setup Frontend**
   - Connect frontend to these APIs
   - Use token for authentication

4. **Configure Payment Gateway**
   - Get Stripe test keys
   - Get SSLCommerz test keys
   - Test payment flows

5. **Deploy**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Choose deployment platform
   - Setup production environment

---

## 📞 Support Resources

### Documentation
- [Complete API Documentation](./API_DOCUMENTATION.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Features List](./FEATURES.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)

### External Resources
- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [JWT.io](https://jwt.io)
- [Stripe Docs](https://stripe.com/docs)
- [SSLCommerz Docs](https://developer.sslcommerz.com)

---

## 🎉 You're Ready!

Your RentNest backend is now running. Start building amazing features! 🚀

---

### Made with ❤️ for the rental market
