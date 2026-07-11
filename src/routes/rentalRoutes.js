const express = require('express');
const { verifyToken, authorize, isTenant, isLandlord } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  validateSubmitRentalRequest,
  validateRejectRentalRequest,
  validateMongoId
} = require('../middleware/validators');
const {
  submitRentalRequest,
  getUserRentalRequests,
  getRentalRequestDetails,
  getLandlordRentalRequests,
  approveRentalRequest,
  rejectRentalRequest
} = require('../controllers/rentalController');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Tenant routes
router.post('/', verifyToken, isTenant, validateSubmitRentalRequest, handleValidationErrors, submitRentalRequest);
router.get('/', verifyToken, isTenant, getUserRentalRequests);

// Landlord routes
router.get('/landlord/requests', verifyToken, isLandlord, getLandlordRentalRequests);
router.patch('/:id/approve', verifyToken, isLandlord, validateMongoId('id'), handleValidationErrors, approveRentalRequest);
router.patch('/:id/reject', verifyToken, isLandlord, validateRejectRentalRequest, handleValidationErrors, rejectRentalRequest);

// Get rental request details
router.get('/:id', verifyToken, validateMongoId('id'), handleValidationErrors, getRentalRequestDetails);

module.exports = router;
