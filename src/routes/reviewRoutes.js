const express = require('express');
const { verifyToken, authorize, isTenant } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { validateReviewCreate, validateReviewUpdate, validateMongoId } = require('../middleware/validators');
const {
  createReview,
  getPropertyReviews,
  getLandlordReviews,
  getReviewDetails,
  updateReview,
  deleteReview,
  markReviewHelpful
} = require('../controllers/reviewController');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Create review (Tenant only)
router.post('/', verifyToken, isTenant, validateReviewCreate, handleValidationErrors, createReview);

// Get property reviews
router.get('/property/:propertyId', validateMongoId('propertyId'), handleValidationErrors, getPropertyReviews);

// Get landlord reviews
router.get('/landlord/:landlordId', validateMongoId('landlordId'), handleValidationErrors, getLandlordReviews);

// Get review details
router.get('/:id', validateMongoId('id'), handleValidationErrors, getReviewDetails);

// Update review (Tenant only)
router.put('/:id', verifyToken, isTenant, validateReviewUpdate, handleValidationErrors, updateReview);

// Delete review (Tenant only)
router.delete('/:id', validateMongoId('id'), handleValidationErrors, verifyToken, deleteReview);

// Mark review as helpful
router.patch('/:id/helpful', validateMongoId('id'), handleValidationErrors, verifyToken, markReviewHelpful);

module.exports = router;
