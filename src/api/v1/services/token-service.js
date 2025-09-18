const jwt = require('jsonwebtoken');
const tokenData = require('../queries/token-query');
const dateUtils = require('../utils/date-utils');
const technicalMessagesUtils = require('../utils/technical-messages-utils');
const ApiError = require('../exceptions/api-error');

const FIFTEEN_MINUTES_IN_SECONDS = 900;
const DURATION_FIFTEEN_MINUTES = '15m';
const DURATION_THIRTY_DAYS = '30d';

class TokenService {
  generateAuthTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: DURATION_FIFTEEN_MINUTES
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: DURATION_THIRTY_DAYS
    });

    return {
      accessToken,
      refreshToken
    };
  }

  generateResetToken(payload) {
    return jwt.sign(payload, process.env.JWT_RESET_PASSWORD_SECRET, {
      expiresIn: '15m'
    });
  }

  validateAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return null;
    }
  }

  validateResetToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET);
    } catch (err) {
      return null;
    }
  }

  async saveRefreshToken(userId, refreshToken) {
    const token = await tokenData.getRefreshTokenByUserId(userId);

    if (token) {
      return await tokenData.updateRefreshToken(userId, refreshToken);
    }

    await tokenData.createRefreshToken(userId, refreshToken);
  }

  async saveResetToken(userId, resetToken) {
    const resetTokenData = await tokenData.getResetTokenByUserId(userId);

    if (resetTokenData) {
      const resetDate = dateUtils.convertIsoToMilliseconds(
        resetTokenData.reset_date
      );

      const isDifference = dateUtils.getDifferenceInTime(
        resetDate,
        FIFTEEN_MINUTES_IN_SECONDS
      );

      if (isDifference) {
        throw ApiError.badRequest(
          technicalMessagesUtils.tokenMessages.TRY_AGAIN_LATER
        );
      }

      return await tokenData.updateResetToken(userId, resetToken);
    }

    await tokenData.createResetToken(userId, resetToken);
  }

  async generateAndSaveRefreshTokens(userData) {
    const tokens = this.generateAuthTokens(userData);

    await this.saveRefreshToken(userData.id, tokens.refreshToken);

    return tokens;
  }

  async generateAndSaveResetToken(userData) {
    const resetToken = this.generateResetToken(userData);

    await this.saveResetToken(userData.id, resetToken);

    return resetToken;
  }
}

module.exports = new TokenService();
