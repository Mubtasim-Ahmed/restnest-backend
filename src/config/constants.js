// User Roles
const ROLES = {
  TENANT: 'tenant',
  LANDLORD: 'landlord',
  ADMIN: 'admin'
};

// Rental Request Status
const RENTAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAYMENT_PENDING: 'payment_pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Payment Methods
const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  SSLCOMMERZ: 'sslcommerz'
};

// Property Status
const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive'
};

module.exports = {
  ROLES,
  RENTAL_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PROPERTY_STATUS
};
