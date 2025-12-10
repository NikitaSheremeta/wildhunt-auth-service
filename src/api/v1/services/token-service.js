const jwt = require('jsonwebtoken');
const tokenData = require('../data/token-data');

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

  async saveRefreshToken(userId, refreshToken) {
    const token = await tokenData.getRefreshTokenByUserId(userId);

    if (token) {
      return await tokenData.updateRefreshToken(userId, refreshToken);
    }

    await tokenData.createRefreshToken(userId, refreshToken);
  }

  async generateAndSaveRefreshTokens(userData) {
    const tokens = this.generateAuthTokens(userData);

    await this.saveRefreshToken(userData.id, tokens.refreshToken);

    return tokens;
  }
}

module.exports = new TokenService();
