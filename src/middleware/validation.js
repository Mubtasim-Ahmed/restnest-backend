const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errorDetails: errors.array().map((err) => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = { handleValidationErrors };
