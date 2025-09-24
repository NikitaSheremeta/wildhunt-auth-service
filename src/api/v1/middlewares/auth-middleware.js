const ApiError = require('../exceptions/api-error');
const tokenService = require('../services/token-service');

module.exports = function (roles) {
  return function (req, res, next) {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
        return next(ApiError.unauthorizedError());
      }

      const [bearer, accessToken] = authorizationHeader.split(' ');

      if (bearer !== 'Bearer' || !accessToken) {
        return next(ApiError.unauthorizedError());
      }

      const userData = tokenService.validateAccessToken(accessToken);

      if (!userData) {
        return next(ApiError.unauthorizedError());
      }

      let hasRole = false;

      userData.roles.forEach((role) => {
        if (roles.includes(Number(role))) {
          hasRole = true;
        }
      });

      if (!hasRole) {
        return next(ApiError.forbiddenError());
      }

      next();
    } catch (err) {
      return next(ApiError.unauthorizedError());
    }
  };
};
