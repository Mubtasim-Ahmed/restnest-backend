const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { ROLES } = require('../config/constants');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned'
      });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Middleware to check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware to check if user is tenant
const isTenant = (req, res, next) => {
  if (req.userRole !== ROLES.TENANT) {
    return res.status(403).json({
      success: false,
      message: 'This action is only for tenants'
    });
  }
  next();
};

// Middleware to check if user is landlord
const isLandlord = (req, res, next) => {
  if (req.userRole !== ROLES.LANDLORD) {
    return res.status(403).json({
      success: false,
      message: 'This action is only for landlords'
    });
  }
  next();
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'This action is only for admins'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  authorize,
  isTenant,
  isLandlord,
  isAdmin
};
