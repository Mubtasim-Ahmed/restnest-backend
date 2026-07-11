// Middleware to normalize error responses and ensure structured error payloads
const responseNormalizer = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (body && typeof body === 'object' && body.success === false) {
      if (body.errorDetails === undefined) {
        body.errorDetails = null;
      }
    }
    return originalJson(body);
  };

  next();
};

module.exports = responseNormalizer;
