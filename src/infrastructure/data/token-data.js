const db = require('../config/db');

class TokenData {
  // SELECT
  async getRefreshTokenByUserId(userId) {
    return await db.selectOne(
      'SELECT user_id, token FROM refresh_tokens WHERE user_id = ? LIMIT 1',
      [userId]
    );
  }

  async getResetTokenByUserId(userId) {
    return await db.selectOne(
      'SELECT user_id, token, reset_date FROM reset_tokens WHERE user_id = ? LIMIT 1',
      [userId]
    );
  }

  // INSERT
  async createRefreshToken(userId, refreshToken) {
    return await db.exec(
      'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
      [userId, refreshToken]
    );
  }

  async createResetToken(userId, resetToken) {
    return await db.exec(
      'INSERT INTO reset_tokens (user_id, token) VALUES (?, ?)',
      [userId, resetToken]
    );
  }

  // UPDATE
  async updateRefreshToken(userId, refreshToken) {
    return await db.execAffected(
      'UPDATE refresh_tokens SET token = ? WHERE user_id = ?',
      [refreshToken, userId]
    );
  }

  async updateResetToken(userId, resetToken) {
    return await db.execAffected(
      'UPDATE reset_tokens SET reset_date = now(), token = ? WHERE user_id = ?',
      [resetToken, userId]
    );
  }

  // DELETE
  async deleteRefreshToken(refreshToken) {
    return await db.execAffected('DELETE FROM refresh_tokens WHERE token = ?', [
      refreshToken
    ]);
  }

  async deleteResetToken(resetToken) {
    return await db.execAffected('DELETE FROM reset_tokens WHERE token = ?', [
      resetToken
    ]);
  }
}

module.exports = new TokenData();
