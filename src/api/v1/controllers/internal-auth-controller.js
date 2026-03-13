const tokenService = require('../services/token-service');

const DEFAULT_INTERNAL_AUTH_ISSUER = 'wildhunt-auth-service';
const DEFAULT_INTERNAL_AUTH_AUDIENCE = 'wildhunt-launcher';

class InternalAuthController {
  async introspect(req, res, next) {
    try {
      const { accessToken } = req.body;
      const userData = tokenService.validateAccessToken(accessToken);

      if (!userData) {
        return res.status(401).json({
          active: false
        });
      }

      const userId = String(userData.id);
      const login = userData.userName;

      return res.json({
        active: true,
        userId,
        sub: userId,
        login,
        nickname: login,
        roles: userData.roles || [],
        exp: userData.exp,
        iss:
          process.env.INTERNAL_AUTH_ISSUER || DEFAULT_INTERNAL_AUTH_ISSUER,
        aud:
          process.env.INTERNAL_AUTH_AUDIENCE || DEFAULT_INTERNAL_AUTH_AUDIENCE
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InternalAuthController();
