The following SIX requirements are MANDATORY:

API Documentation - Provide Postman collection or Swagger/OpenAPI docs covering all endpoints
Consistent Error Responses - All errors must return structured JSON ({ success, message, errorDetails })
Commits - 20 meaningful backend commits with descriptive messages
Input Validation - Server-side validation on all endpoints with proper error messages
Admin Credentials - Provide working admin email & password
Payment Integration - Must integrate Stripe or SSLCommerz for processing payments. Simulated/fake payments (Cash on Delivery, Pay Later) are NOT accepted.
❌ Failure to complete any of these = 0 MARKS

Backend GitHub Repo	✅
Live API URL	✅
API Documentation (Postman/Swagger)	✅
Demo Video (3-5 min)	✅
Admin Credentials	✅
Example:

Backend Repo     : https://github.com/your-username/rentnest-backend
Live API         : https://rentnest-api.vercel.app
API Docs         : https://documenter.getpostman.com/view/xxx
Demo Video       : https://drive.google.com/file/d/xxx/view
Admin Email      : admin@rentnest.com
Admin Password   : admin123

🛠️ Tech Stack
Backend
Technology	Purpose
Node.js + Express	REST API
TypeScript	Type safety (recommended)
Postgres + Prisma	Database + ORM
JWT	Authentication
Deployment
Service	Purpose
Vercel/Render	Backend API deployment

Roles: Each project has 3 fixed roles. Users select during registration.
Payment: Payment integration is MANDATORY. You must integrate either Stripe or SSLCommerz for processing payments. Include endpoints for creating payment intents/sessions, handling payment confirmations, and tracking payment status.
No Frontend Required: This is a backend-only assignment. Test your API via Postman/Thunder Client.
Flexibility: Endpoints listed in each variant are examples. Modify as needed.