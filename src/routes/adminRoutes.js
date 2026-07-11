const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  getAllPropertiesAdmin,
  getAllRentalRequests,
  getDashboardStatistics
} = require('../controllers/adminController');
const { ROLES } = require('../config/constants');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, authorize(ROLES.ADMIN));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

// Properties
router.get('/properties', getAllPropertiesAdmin);

// Rental requests
router.get('/rentals', getAllRentalRequests);

// Dashboard statistics
router.get('/statistics', getDashboardStatistics);

module.exports = router;
