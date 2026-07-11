const express = require('express');
const { verifyToken, authorize, isTenant } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  validateStripePaymentIntent,
  validateStripeVerify,
  validateSslcommerzInitiate,
  validateMongoId
} = require('../middleware/validators');
const {
  createStripePaymentIntent,
  initiateSslcommerzPayment,
  verifyStripePayment,
  handleSslcommerzIPN,
  getUserPaymentHistory,
  getPaymentDetails
} = require('../controllers/paymentController');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Tenant routes
router.post('/stripe/create-intent', verifyToken, isTenant, validateStripePaymentIntent, handleValidationErrors, createStripePaymentIntent);
router.post('/stripe/verify', verifyToken, isTenant, validateStripeVerify, handleValidationErrors, verifyStripePayment);
router.post('/sslcommerz/initiate', verifyToken, isTenant, validateSslcommerzInitiate, handleValidationErrors, initiateSslcommerzPayment);

// Webhook for SSLCommerz IPN (public route)
router.post('/sslcommerz/ipn', handleSslcommerzIPN);

// Get payment history and details
router.get('/', verifyToken, isTenant, getUserPaymentHistory);
router.get('/:id', verifyToken, validateMongoId('id'), handleValidationErrors, getPaymentDetails);

module.exports = router;
