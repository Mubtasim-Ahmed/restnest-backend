# RentNest API Documentation

Complete API documentation for the RentNest rental property marketplace backend.

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 📋 API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "+1234567890",
  "role": "tenant", // or "landlord"
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": { ... }
}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "bio": "I'm a software developer"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### Change Password
```
PATCH /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Property Endpoints

#### Get All Properties (with filters)
```
GET /api/properties?city=New York&minPrice=500&maxPrice=2000&bedrooms=2&page=1&limit=10

Query Parameters:
- city: Search by city
- minPrice: Minimum monthly rent
- maxPrice: Maximum monthly rent
- category: Category ID
- amenities: Amenity name(s)
- bedrooms: Number of bedrooms
- bathrooms: Number of bathrooms
- page: Page number (default: 1)
- limit: Results per page (default: 10)

Response (200):
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Get Property by ID
```
GET /api/properties/:id

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### Create Property (Landlord Only)
```
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beautiful Apartment",
  "description": "Spacious 2-bedroom apartment",
  "category": "category_id",
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "price": {
    "monthly": 1500,
    "securityDeposit": 3000,
    "currency": "USD"
  },
  "amenities": ["wifi", "parking", "laundry"],
  "bedrooms": 2,
  "bathrooms": 1,
  "squareFootage": 900,
  "images": [
    {
      "url": "https://...",
      "caption": "Living room"
    }
  ],
  "maxTenants": 2,
  "petPolicy": {
    "allowed": true,
    "details": "Small pets only"
  }
}

Response (201):
{
  "success": true,
  "message": "Property created successfully",
  "data": { ... }
}
```

#### Update Property (Landlord Only)
```
PUT /api/properties/:id
Authorization: Bearer <token>
Content-Type: application/json

{ ... property fields to update ... }

Response (200):
{
  "success": true,
  "message": "Property updated successfully",
  "data": { ... }
}
```

#### Delete Property (Landlord Only)
```
DELETE /api/properties/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Property deleted successfully"
}
```

#### Get Landlord's Properties
```
GET /api/properties/landlord/my-properties
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Landlord properties fetched successfully",
  "data": [ ... ]
}
```

---

### Rental Request Endpoints

#### Submit Rental Request (Tenant Only)
```
POST /api/rentals
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "property_id",
  "moveInDate": "2024-08-01T00:00:00Z",
  "moveOutDate": "2025-08-01T00:00:00Z",
  "numberOfTenants": 2,
  "message": "I'm very interested in this property"
}

Response (201):
{
  "success": true,
  "message": "Rental request submitted successfully",
  "data": { ... }
}
```

#### Get User's Rental Requests (Tenant Only)
```
GET /api/rentals?status=pending&page=1&limit=10
Authorization: Bearer <token>

Query Parameters:
- status: Filter by status (pending, approved, rejected, etc.)
- page: Page number
- limit: Results per page

Response (200):
{
  "success": true,
  "message": "Rental requests fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Get Rental Request Details
```
GET /api/rentals/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### Get Landlord's Rental Requests (Landlord Only)
```
GET /api/rentals/landlord/requests?status=pending
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Landlord rental requests fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Approve Rental Request (Landlord Only)
```
PATCH /api/rentals/:id/approve
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Rental request approved successfully",
  "data": { ... }
}
```

#### Reject Rental Request (Landlord Only)
```
PATCH /api/rentals/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "Property no longer available"
}

Response (200):
{
  "success": true,
  "message": "Rental request rejected successfully",
  "data": { ... }
}
```

---

### Payment Endpoints

#### Create Stripe Payment Intent (Tenant Only)
```
POST /api/payments/stripe/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "rentalRequestId": "rental_request_id"
}

Response (200):
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "paymentId": "...",
    "clientSecret": "...",
    "amount": 4500,
    "currency": "USD"
  }
}
```

#### Verify Stripe Payment (Tenant Only)
```
POST /api/payments/stripe/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_...",
  "paymentId": "payment_id"
}

Response (200):
{
  "success": true,
  "message": "Payment verified successfully",
  "data": { ... }
}
```

#### Initiate SSLCommerz Payment (Tenant Only)
```
POST /api/payments/sslcommerz/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rentalRequestId": "rental_request_id"
}

Response (200):
{
  "success": true,
  "message": "Payment session initiated successfully",
  "data": {
    "paymentId": "...",
    "redirectUrl": "https://...",
    "amount": 4500,
    "currency": "BDT"
  }
}
```

#### Get Payment History (Tenant Only)
```
GET /api/payments?status=completed&page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Payment history fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Get Payment Details
```
GET /api/payments/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { ... }
}
```

---

### Review Endpoints

#### Create Review (Tenant Only)
```
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rentalRequestId": "rental_request_id",
  "rating": 5,
  "title": "Excellent Property!",
  "comment": "Very comfortable and clean apartment",
  "categories": {
    "cleanliness": 5,
    "communication": 4,
    "accuracy": 5,
    "location": 5,
    "amenities": 4
  },
  "images": ["url1", "url2"]
}

Response (201):
{
  "success": true,
  "message": "Review created successfully",
  "data": { ... }
}
```

#### Get Property Reviews
```
GET /api/reviews/property/:propertyId?page=1&limit=10

Response (200):
{
  "success": true,
  "message": "Property reviews fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Get Landlord Reviews
```
GET /api/reviews/landlord/:landlordId?page=1&limit=10

Response (200):
{
  "success": true,
  "message": "Landlord reviews fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Get Review Details
```
GET /api/reviews/:id

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### Update Review (Tenant Only)
```
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "title": "Good Property",
  "comment": "Updated comment"
}

Response (200):
{
  "success": true,
  "message": "Review updated successfully",
  "data": { ... }
}
```

#### Delete Review (Tenant Only)
```
DELETE /api/reviews/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Review deleted successfully"
}
```

#### Mark Review as Helpful
```
PATCH /api/reviews/:id/helpful
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Review marked as helpful",
  "data": { ... }
}
```

---

### Category Endpoints

#### Get All Categories
```
GET /api/categories

Response (200):
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [ ... ]
}
```

#### Get Category by ID
```
GET /api/categories/:id

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### Create Category (Admin Only)
```
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Apartment",
  "description": "Modern apartment units",
  "icon": "🏢",
  "image": "url"
}

Response (201):
{
  "success": true,
  "message": "Category created successfully",
  "data": { ... }
}
```

#### Update Category (Admin Only)
```
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{ ... category fields to update ... }

Response (200):
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

#### Delete Category (Admin Only)
```
DELETE /api/categories/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### Admin Endpoints

All admin endpoints require admin role.

#### Get All Users (Admin Only)
```
GET /api/admin/users?role=tenant&isBanned=false&page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Get User by ID (Admin Only)
```
GET /api/admin/users/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### Ban User (Admin Only)
```
PATCH /api/admin/users/:id/ban
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "User banned successfully",
  "data": { ... }
}
```

#### Unban User (Admin Only)
```
PATCH /api/admin/users/:id/unban
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "User unbanned successfully",
  "data": { ... }
}
```

#### Get All Properties (Admin Only)
```
GET /api/admin/properties?status=available&page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Get All Rental Requests (Admin Only)
```
GET /api/admin/rentals?status=pending&page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Rental requests fetched successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Get Dashboard Statistics (Admin Only)
```
GET /api/admin/statistics
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "tenants": 100,
      "landlords": 45,
      "banned": 5
    },
    "properties": {
      "total": 200
    },
    "rentalRequests": {
      "total": 500,
      "pending": 50,
      "approved": 300,
      "completed": 150
    }
  }
}
```

---

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration

3. Start the server:
```bash
npm run dev
```

4. Server will run on `http://localhost:5000`

---

## 📝 Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔒 Security Notes

- Always use HTTPS in production
- Store sensitive data securely
- Use environment variables for secrets
- Implement rate limiting
- Validate all user inputs
- Keep JWT secret secure

---
