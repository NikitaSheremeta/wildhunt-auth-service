const authService = require('../services/auth-service');
const statusCodesUtils = require('../utils/status-codes-utils');

const cookieConfig = {
  // eslint-disable-next-line no-magic-numbers
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'strict',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production'
};

class AuthController {
  async registration(req, res, next) {
    try {
      const userData = await authService.userRegistration(req.body);

      res.cookie('refreshToken', userData.refreshToken, cookieConfig);

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { login, password } = req.body;

      const userData = await authService.userLogin(login, password);

      res.cookie('refreshToken', userData.refreshToken, cookieConfig);

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      await authService.userLogout(refreshToken);

      res.clearCookie('refreshToken');

      return res.json(statusCodesUtils.httpStatus.OK.code);
    } catch (err) {
      next(err);
    }
  }

  async activate(req, res, next) {
    try {
      await authService.userActivation(req.params.link);

      return res.redirect(process.env.API_URL);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const userData = await authService.userForgotPassword(req.body.email);

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      await authService.userResetPassword(req.params.token);

      return res.redirect(process.env.API_URL);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const userData = await authService.userRefreshToken(refreshToken);

      res.cookie('refreshToken', userData.refreshToken, cookieConfig);

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
