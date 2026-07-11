# RentNest - Testing Guide

Comprehensive testing guide for RentNest API endpoints.

---

## 🧪 Setup Testing Environment

### Prerequisites
- Node.js installed
- MongoDB running locally or access to MongoDB Atlas
- Postman or any API testing tool

### Install Test Dependencies

```bash
npm install --save-dev jest supertest
```

---

## 📝 Manual Testing with Postman

### 1. Import Collection

Create a Postman collection with all endpoints and organize by category.

### 2. Set Environment Variables

```json
{
  "base_url": "http://localhost:5000",
  "token": "",
  "adminToken": "",
  "landlordToken": "",
  "tenantToken": "",
  "propertyId": "",
  "rentalRequestId": "",
  "categoryId": "",
  "paymentId": ""
}
```

---

## 🔑 Authentication Testing

### Test 1: User Registration

**Request:**
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "+1234567890",
  "role": "tenant",
  "address": "123 Test St",
  "city": "Test City",
  "state": "TC",
  "zipCode": "12345",
  "country": "Test Country"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

---

### Test 2: User Login

**Request:**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

**Store the token for subsequent requests.**

---

### Test 3: Get Current User

**Request:**
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

## 🏘️ Property Testing

### Test 4: Create Property (Landlord)

**Prerequisites:** Login as landlord

**Request:**
```
POST /api/properties
Authorization: Bearer <landlord_token>
Content-Type: application/json

{
  "title": "Test Property",
  "description": "A test property",
  "category": "category_id",
  "location": {
    "address": "123 Test St",
    "city": "Test City",
    "state": "TC",
    "zipCode": "12345",
    "country": "Test Country"
  },
  "price": {
    "monthly": 1000,
    "securityDeposit": 2000
  },
  "amenities": ["wifi", "parking"],
  "bedrooms": 2,
  "bathrooms": 1,
  "maxTenants": 2
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": { ... }
}
```

**Save propertyId for later tests.**

---

### Test 5: Get All Properties (Public)

**Request:**
```
GET /api/properties?city=Test%20City&page=1&limit=10
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Test 6: Get Property by ID

**Request:**
```
GET /api/properties/<propertyId>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 🏠 Rental Request Testing

### Test 7: Submit Rental Request (Tenant)

**Prerequisites:** Login as tenant, have a property ID

**Request:**
```
POST /api/rentals
Authorization: Bearer <tenant_token>
Content-Type: application/json

{
  "propertyId": "<propertyId>",
  "moveInDate": "2024-08-01T00:00:00Z",
  "moveOutDate": "2025-08-01T00:00:00Z",
  "numberOfTenants": 2,
  "message": "I'm interested in renting this property"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Rental request submitted successfully",
  "data": { ... }
}
```

**Save rentalRequestId for later tests.**

---

### Test 8: Get Tenant's Rental Requests

**Request:**
```
GET /api/rentals?status=pending
Authorization: Bearer <tenant_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Rental requests fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Test 9: Approve Rental Request (Landlord)

**Request:**
```
PATCH /api/rentals/<rentalRequestId>/approve
Authorization: Bearer <landlord_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Rental request approved successfully",
  "data": { ... }
}
```

---

## 💳 Payment Testing

### Test 10: Create Stripe Payment Intent

**Prerequisites:** Rental request must be approved

**Request:**
```
POST /api/payments/stripe/create-intent
Authorization: Bearer <tenant_token>
Content-Type: application/json

{
  "rentalRequestId": "<rentalRequestId>"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "paymentId": "...",
    "clientSecret": "...",
    "amount": 3000,
    "currency": "USD"
  }
}
```

---

### Test 11: Get Payment History

**Request:**
```
GET /api/payments?status=completed
Authorization: Bearer <tenant_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment history fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## ⭐ Review Testing

### Test 12: Create Review

**Prerequisites:** Rental must be completed, rental status = 'completed'

**Request:**
```
POST /api/reviews
Authorization: Bearer <tenant_token>
Content-Type: application/json

{
  "rentalRequestId": "<rentalRequestId>",
  "rating": 5,
  "title": "Excellent Property!",
  "comment": "Very comfortable and clean",
  "categories": {
    "cleanliness": 5,
    "communication": 4,
    "accuracy": 5,
    "location": 5,
    "amenities": 4
  }
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": { ... }
}
```

---

### Test 13: Get Property Reviews

**Request:**
```
GET /api/reviews/property/<propertyId>?page=1&limit=10
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Property reviews fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## 👨‍💼 Admin Testing

### Test 14: Get All Users (Admin)

**Prerequisites:** Login as admin

**Request:**
```
GET /api/admin/users?role=tenant&page=1&limit=10
Authorization: Bearer <admin_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### Test 15: Ban User (Admin)

**Request:**
```
PATCH /api/admin/users/<userId>/ban
Authorization: Bearer <admin_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User banned successfully",
  "data": { ... }
}
```

---

### Test 16: Get Dashboard Statistics (Admin)

**Request:**
```
GET /api/admin/statistics
Authorization: Bearer <admin_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "users": { ... },
    "properties": { ... },
    "rentalRequests": { ... }
  }
}
```

---

## ✅ Test Checklist

### Authentication
- [ ] Register with valid data
- [ ] Register with invalid email
- [ ] Register with mismatched passwords
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Login with non-existent email
- [ ] Access protected endpoint without token
- [ ] Access protected endpoint with invalid token
- [ ] Access admin endpoint as regular user

### Properties
- [ ] Create property as landlord
- [ ] Create property as tenant (should fail)
- [ ] Get all properties (public)
- [ ] Filter properties by city
- [ ] Filter properties by price
- [ ] Get property details
- [ ] Update own property
- [ ] Update someone else's property (should fail)
- [ ] Delete property

### Rental Requests
- [ ] Submit rental request as tenant
- [ ] View own rental requests
- [ ] Try to view others' requests (should fail)
- [ ] Approve request as landlord
- [ ] Reject request as landlord
- [ ] Cannot approve non-existent request

### Payments
- [ ] Create payment intent
- [ ] Verify payment
- [ ] Check payment history
- [ ] View payment details

### Reviews
- [ ] Create review after completed rental
- [ ] Try to review non-completed rental (should fail)
- [ ] Get property reviews
- [ ] Get landlord reviews
- [ ] Update own review
- [ ] Delete own review
- [ ] Mark review as helpful

### Admin
- [ ] Get all users
- [ ] Ban user
- [ ] Unban user
- [ ] View all properties
- [ ] View all rental requests
- [ ] Access statistics

---

## 🔍 Error Testing

### Test Invalid Inputs

```bash
# Missing required fields
POST /api/auth/register
{
  "firstName": "Test"
}

# Invalid email format
POST /api/auth/register
{
  "email": "invalid-email"
}

# Duplicate email
POST /api/auth/register
{
  "email": "existing@example.com"
}
```

---

## 🐛 Debugging Tips

1. **Check console logs** for error details
2. **Verify MongoDB connection** before testing
3. **Use Postman collection** for organized testing
4. **Check token expiration** if auth fails
5. **Verify role-based access** is working
6. **Test pagination** with different limits
7. **Check date formats** for move-in/out dates

---

## 📊 Performance Testing

### Load Testing with Apache Bench

```bash
# Test endpoint with 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:5000/api/properties

# Test POST endpoint
ab -n 100 -c 5 -p data.json -T application/json http://localhost:5000/api/auth/login
```

---
