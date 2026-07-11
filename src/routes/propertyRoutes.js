const express = require('express');
const { verifyToken, authorize, isLandlord } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  validateCreateProperty,
  validateUpdateProperty
} = require('../middleware/validators');
const {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getLandlordProperties
} = require('../controllers/propertyController');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Public routes
router.get('/', getAllProperties);

// Get landlord's properties
router.get('/landlord/my-properties', verifyToken, isLandlord, getLandlordProperties);

router.get('/:id', getPropertyById);

// Landlord routes
router.post('/', verifyToken, isLandlord, validateCreateProperty, handleValidationErrors, createProperty);
router.put('/:id', verifyToken, isLandlord, validateUpdateProperty, handleValidationErrors, updateProperty);
router.delete('/:id', verifyToken, isLandlord, deleteProperty);

module.exports = router;
