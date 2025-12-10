const sqlExecute = require('../utils/sql-execute-utils');

class TokenData {
  // SELECT
  async getRefreshTokenByUserId(userId) {
    return await sqlExecute.selectOne(
      'SELECT user_id, token FROM refresh_tokens WHERE user_id = ? LIMIT 1',
      [userId]
    );
  }

  // INSERT
  async createRefreshToken(userId, refreshToken) {
    return await sqlExecute.exec(
      'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
      [userId, refreshToken]
    );
  }

  // UPDATE
  async updateRefreshToken(userId, refreshToken) {
    return await sqlExecute.execAffected(
      'UPDATE refresh_tokens SET token = ? WHERE user_id = ?',
      [refreshToken, userId]
    );
  }

  // DELETE
  async deleteRefreshToken(refreshToken) {
    return await sqlExecute.execAffected(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [refreshToken]
    );
  }
}

module.exports = new TokenData();
