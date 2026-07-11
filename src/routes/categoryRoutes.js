const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { validateCreateCategory, validateUpdateCategory, validateMongoId } = require('../middleware/validators');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', validateMongoId('id'), handleValidationErrors, getCategoryById);

// Admin routes
router.post('/', verifyToken, authorize(ROLES.ADMIN), validateCreateCategory, handleValidationErrors, createCategory);
router.put('/:id', verifyToken, authorize(ROLES.ADMIN), validateMongoId('id'), validateUpdateCategory, handleValidationErrors, updateCategory);
router.delete('/:id', verifyToken, authorize(ROLES.ADMIN), validateMongoId('id'), handleValidationErrors, deleteCategory);

module.exports = router;
