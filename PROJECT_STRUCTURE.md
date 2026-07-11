# RentNest - Project Structure & Architecture

Complete project structure and architecture documentation.

---

## 📁 Project Directory Structure

```
RentNest/
│
├── src/
│   ├── config/
│   │   ├── database.js              # MongoDB connection configuration
│   │   └── constants.js             # Application constants (roles, statuses)
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── propertyController.js    # Property management
│   │   ├── rentalController.js      # Rental request handling
│   │   ├── paymentController.js     # Payment processing
│   │   ├── reviewController.js      # Review management
│   │   ├── categoryController.js    # Property categories
│   │   └── adminController.js       # Admin operations
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification & role checking
│   │   ├── errorHandler.js          # Global error handling
│   │   └── validation.js            # Input validation
│   │
│   ├── models/
│   │   ├── User.js                  # User schema (tenant, landlord, admin)
│   │   ├── Property.js              # Property listing schema
│   │   ├── RentalRequest.js         # Rental request schema
│   │   ├── Payment.js               # Payment transaction schema
│   │   ├── Review.js                # Review schema
│   │   └── Category.js              # Property category schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── propertyRoutes.js        # Property endpoints
│   │   ├── rentalRoutes.js          # Rental request endpoints
│   │   ├── paymentRoutes.js         # Payment endpoints
│   │   ├── reviewRoutes.js          # Review endpoints
│   │   ├── categoryRoutes.js        # Category endpoints
│   │   └── adminRoutes.js           # Admin endpoints
│   │
│   ├── utils/
│   │   ├── stripeService.js         # Stripe payment integration
│   │   ├── sslcommerzService.js     # SSLCommerz payment integration
│   │   └── emailService.js          # Email notifications
│   │
│   └── app.js                       # Express app setup
│
├── server.js                        # Entry point
├── seed.js                          # Database seeding script
├── package.json                     # Dependencies
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
│
├── README.md                        # Project overview
├── API_DOCUMENTATION.md             # Complete API documentation
├── DEPLOYMENT.md                    # Deployment guide
├── TESTING.md                       # Testing guide
└── PROJECT_STRUCTURE.md             # This file

```

---

## 🏗️ Architecture Overview

### MVC (Model-View-Controller) Pattern

```
Request → Route → Middleware → Controller → Model → Database
                                    ↓
                         Response ← Middleware
```

### Data Flow

1. **Request** arrives at Express server
2. **Routing** directs to appropriate route
3. **Middleware** validates token and permissions
4. **Controller** handles business logic
5. **Model** interacts with MongoDB
6. **Response** sent back to client

---

## 🔄 Request/Response Cycle

```javascript
// Example: Create Property Request
POST /api/properties
{
  // Request body with property details
}

// Middleware chain:
1. verifyToken - Check JWT token
2. isLandlord - Check if user is landlord
3. handleValidationErrors - Validate input

// Controller:
createProperty() - Validate data, save to DB

// Response:
{
  "success": true,
  "message": "Property created successfully",
  "data": { ... property object ... }
}
```

---

## 📊 Database Schema Relationships

```
User (Parent)
├── Properties (one-to-many as landlord)
├── RentalRequests (one-to-many as tenant/landlord)
├── Payments (one-to-many as tenant/landlord)
└── Reviews (one-to-many as tenant/landlord)

Property
├── Category (many-to-one)
├── Landlord (User) (many-to-one)
├── RentalRequests (one-to-many)
└── Reviews (one-to-many)

RentalRequest
├── Tenant (User) (many-to-one)
├── Landlord (User) (many-to-one)
├── Property (many-to-one)
├── Payment (one-to-one)
└── Status tracking (pending → approved → active → completed)

Payment
├── RentalRequest (many-to-one)
├── Tenant (User) (many-to-one)
├── Landlord (User) (many-to-one)
└── Status tracking (pending → completed/failed)

Review
├── Tenant (User) (many-to-one)
├── Landlord (User) (many-to-one)
├── Property (many-to-one)
└── RentalRequest (many-to-one)

Category
└── Properties (one-to-many)
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow

```
1. User Registration/Login
   ↓
2. Server generates JWT token
   {
     id: userId,
     iat: issuedAt,
     exp: expiresAt (7 days)
   }
   ↓
3. Client stores token
   ↓
4. Client sends token in every request header:
   Authorization: Bearer <token>
   ↓
5. Server verifies token with JWT_SECRET
   ↓
6. Request proceeds or rejected
```

### Role-Based Access Control (RBAC)

```
Tenant
├── Can browse properties
├── Can submit rental requests
├── Can make payments
├── Can leave reviews
└── Can manage own profile

Landlord
├── Can create properties
├── Can manage own properties
├── Can approve/reject requests
├── Can view tenant history
└── Can receive payments

Admin
├── Can manage users (ban/unban)
├── Can view all properties
├── Can view all requests
├── Can manage categories
└── Can access statistics
```

---

## 💳 Payment Processing Flow

### Stripe Payment Flow

```
1. Tenant requests payment
   ↓
2. Backend creates Stripe PaymentIntent
   ↓
3. Returns clientSecret to frontend
   ↓
4. Frontend collects card details
   ↓
5. Frontend confirms payment with Stripe
   ↓
6. Stripe webhook notifies backend
   ↓
7. Backend updates payment status
   ↓
8. Rental status updated to ACTIVE
```

### SSLCommerz Payment Flow

```
1. Tenant requests payment
   ↓
2. Backend initiates SSLCommerz session
   ↓
3. Returns redirect URL to frontend
   ↓
4. Frontend redirects to SSLCommerz payment page
   ↓
5. Customer enters payment details
   ↓
6. SSLCommerz processes payment
   ↓
7. Customer redirected back to app
   ↓
8. Backend receives IPN notification
   ↓
9. Backend validates and updates payment status
```

---

## 🔄 Rental Request Status Flow

```
PENDING
  ├── (Landlord approves)
  ↓
APPROVED
  ├── (Tenant makes payment)
  ↓
PAYMENT_PENDING
  ├── (Payment successful)
  ↓
ACTIVE
  ├── (Rental period ends)
  ↓
COMPLETED
  └── (Can now leave review)

PENDING
  ├── (Landlord rejects)
  ↓
REJECTED
```

---

## 🛡️ Security Features

1. **JWT Authentication**
   - Secure token-based authentication
   - Token expiration (7 days)
   - Secret key encryption

2. **Password Security**
   - Bcrypt hashing (10 salt rounds)
   - Never stored in plain text

3. **Authorization**
   - Role-based access control
   - Resource ownership verification
   - Admin-only endpoints

4. **Input Validation**
   - Express-validator
   - Email format validation
   - Data type checking

5. **Error Handling**
   - Global error middleware
   - Sanitized error messages
   - Secure error logging

6. **Database Security**
   - Mongoose schema validation
   - Connection string encryption
   - SQL injection prevention (using MongoDB)

---

## 📈 Scaling Considerations

### Current State (Single Server)
- Suitable for up to ~10k daily active users
- Single MongoDB instance

### Scaling Steps

1. **Database Scaling**
   - MongoDB replication
   - Sharding for large collections
   - Read replicas for queries

2. **Application Scaling**
   - Horizontal scaling (multiple server instances)
   - Load balancing (Nginx, HAProxy)
   - Container orchestration (Kubernetes)

3. **Caching Layer**
   - Redis for session caching
   - Cache frequently accessed data

4. **CDN**
   - CloudFlare for static content
   - Global content distribution

5. **Monitoring**
   - Application performance monitoring
   - Error tracking (Sentry)
   - Log aggregation (ELK Stack)

---

## 🧪 Testing Strategy

### Unit Testing
- Controller logic
- Middleware functions
- Utility functions

### Integration Testing
- API endpoint testing
- Database interactions
- Payment flow testing

### E2E Testing
- Complete user workflows
- Cross-role scenarios
- Payment processing

---

## 📝 Code Standards

### Naming Conventions
- **Files**: camelCase (e.g., `authController.js`)
- **Functions**: camelCase (e.g., `createProperty()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)
- **Variables**: camelCase (e.g., `rentalRequest`)
- **Classes/Models**: PascalCase (e.g., `User`, `Property`)

### Best Practices
- Consistent error handling
- Input validation on every endpoint
- Proper HTTP status codes
- RESTful API conventions
- DRY (Don't Repeat Yourself) principle
- SOLID principles

---

## 🔗 API Versioning

For future versioning, use:
```
/api/v1/auth/login
/api/v2/auth/login
```

---

## 📚 Dependencies Overview

| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |
| stripe | Payment processing |
| axios | HTTP client |
| dotenv | Environment variables |
| cors | Cross-origin requests |
| nodemailer | Email sending |

---

## 🚀 Deployment Checklist

- [ ] Set production environment
- [ ] Configure secure database
- [ ] Set strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure payment live keys
- [ ] Setup error monitoring
- [ ] Enable logging
- [ ] Configure backups
- [ ] Setup CI/CD
- [ ] Load testing
- [ ] Security audit

---
