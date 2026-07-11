const { body, param, query } = require('express-validator');
const { ROLES } = require('../config/constants');

const validateMongoId = (fieldName = 'id') => [
  param(fieldName)
    .exists().withMessage(`${fieldName} is required`)
    .bail()
    .isUUID().withMessage(`${fieldName} must be a valid UUID`)
];

const validateRegister = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('Password is required').bail().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .trim()
    .notEmpty().withMessage('Confirm password is required')
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords must match'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .bail()
    .custom((value) => Object.values(ROLES).includes(value))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('country').trim().notEmpty().withMessage('Country is required')
];

const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('Password is required')
];

const validateProfileUpdate = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('country').optional().trim().notEmpty().withMessage('Country cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('zipCode').optional().trim().notEmpty().withMessage('Zip code cannot be empty'),
  body('bio').optional().trim().notEmpty().withMessage('Bio cannot be empty')
];

const validateChangePassword = [
  body('oldPassword').trim().notEmpty().withMessage('Old password is required'),
  body('newPassword').trim().notEmpty().withMessage('New password is required').bail().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword')
    .trim()
    .notEmpty().withMessage('Confirm password is required')
    .bail()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords must match')
];

const validateCreateProperty = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('location.address').trim().notEmpty().withMessage('Location address is required'),
  body('location.city').trim().notEmpty().withMessage('Location city is required'),
  body('location.country').trim().notEmpty().withMessage('Location country is required'),
  body('price.monthly')
    .exists().withMessage('Price monthly is required')
    .bail()
    .isFloat({ gt: 0 }).withMessage('Monthly price must be greater than 0'),
  body('price.securityDeposit').optional().isFloat({ min: 0 }).withMessage('Security deposit must be 0 or greater'),
  body('bedrooms').exists().withMessage('Bedrooms is required').bail().isInt({ min: 1 }).withMessage('Bedrooms must be at least 1'),
  body('bathrooms').exists().withMessage('Bathrooms is required').bail().isInt({ min: 1 }).withMessage('Bathrooms must be at least 1'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('minLeaseTerm').optional().isInt({ min: 1 }).withMessage('Minimum lease term must be at least 1'),
  body('maxTenants').optional().isInt({ min: 1 }).withMessage('Maximum tenants must be at least 1')
];

const validateUpdateProperty = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('location.address').optional().trim().notEmpty().withMessage('Location address cannot be empty'),
  body('location.city').optional().trim().notEmpty().withMessage('Location city cannot be empty'),
  body('location.country').optional().trim().notEmpty().withMessage('Location country cannot be empty'),
  body('price.monthly').optional().isFloat({ gt: 0 }).withMessage('Monthly price must be greater than 0'),
  body('price.securityDeposit').optional().isFloat({ min: 0 }).withMessage('Security deposit must be 0 or greater'),
  body('bedrooms').optional().isInt({ min: 1 }).withMessage('Bedrooms must be at least 1'),
  body('bathrooms').optional().isInt({ min: 1 }).withMessage('Bathrooms must be at least 1'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('minLeaseTerm').optional().isInt({ min: 1 }).withMessage('Minimum lease term must be at least 1'),
  body('maxTenants').optional().isInt({ min: 1 }).withMessage('Maximum tenants must be at least 1')
];

const validateSubmitRentalRequest = [
  body('propertyId').exists().withMessage('Property ID is required').bail().isUUID().withMessage('Invalid property ID'),
  body('moveInDate').exists().withMessage('Move-in date is required').bail().isISO8601().withMessage('Move-in date must be a valid date'),
  body('moveOutDate').exists().withMessage('Move-out date is required').bail().isISO8601().withMessage('Move-out date must be a valid date'),
  body('numberOfTenants').exists().withMessage('Number of tenants is required').bail().isInt({ min: 1 }).withMessage('Number of tenants must be at least 1'),
  body('message').optional().trim().isString().withMessage('Message must be a string')
];

const validateReviewCreate = [
  body('rentalRequestId').exists().withMessage('Rental request ID is required').bail().isUUID().withMessage('Invalid rental request ID'),
  body('rating').exists().withMessage('Rating is required').bail().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').exists().withMessage('Title is required').bail().trim().notEmpty().withMessage('Title cannot be empty'),
  body('comment').exists().withMessage('Comment is required').bail().trim().notEmpty().withMessage('Comment cannot be empty')
];

const validateReviewUpdate = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isString().withMessage('Comment must be a string')
];

const validateCreateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty')
];

const validateUpdateCategory = [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty')
];

const validateStripePaymentIntent = [
  body('rentalRequestId').exists().withMessage('Rental request ID is required').bail().isUUID().withMessage('Invalid rental request ID')
];

const validateStripeVerify = [
  body('paymentIntentId').trim().notEmpty().withMessage('Payment intent ID is required'),
  body('paymentId').exists().withMessage('Payment ID is required').bail().isUUID().withMessage('Invalid payment ID')
];

const validateSslcommerzInitiate = [
  body('rentalRequestId').exists().withMessage('Rental request ID is required').bail().isUUID().withMessage('Invalid rental request ID')
];

const validateRejectRentalRequest = [
  ...validateMongoId('id'),
  body('rejectionReason').optional().trim().notEmpty().withMessage('Rejection reason cannot be empty')
];

module.exports = {
  validateMongoId,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateCreateProperty,
  validateUpdateProperty,
  validateSubmitRentalRequest,
  validateReviewCreate,
  validateReviewUpdate,
  validateCreateCategory,
  validateUpdateCategory,
  validateStripePaymentIntent,
  validateStripeVerify,
  validateSslcommerzInitiate,
  validateRejectRentalRequest
};
