const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword
} = require('../middleware/validators');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, validateProfileUpdate, handleValidationErrors, updateProfile);
router.patch('/change-password', verifyToken, validateChangePassword, handleValidationErrors, changePassword);

module.exports = router;
