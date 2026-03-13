const crypto = require('crypto');
const ApiError = require('../exceptions/api-error');

module.exports = function (req, res, next) {
  const serverSecret = req.headers['x-auth-server-secret'];
  const configuredSecret = process.env.INTERNAL_AUTH_SHARED_SECRET;

  if (!serverSecret) {
    return next(ApiError.unauthorizedError());
  }

  if (!configuredSecret) {
    return next(ApiError.forbiddenError());
  }

  const providedBuffer = Buffer.from(serverSecret, 'utf8');
  const expectedBuffer = Buffer.from(configuredSecret, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) {
    return next(ApiError.forbiddenError());
  }

  // Use constant-time comparison for the shared internal secret.
  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return next(ApiError.forbiddenError());
  }

  next();
};
