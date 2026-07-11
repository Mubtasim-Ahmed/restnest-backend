// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma validation / constraint error
  if (err.code === 'P2002') {
    const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : 'field';
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      errorDetails: null
    });
  }

  // Prisma validation / constraint error
  if (err.code === 'P2002') {
    const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : 'field';
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      errorDetails: null
    });
  }

  // Generic validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
      errorDetails: null
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errorDetails: err.details || null
  });
};

module.exports = errorHandler;
