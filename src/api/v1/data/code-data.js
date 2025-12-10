const sqlExecute = require('../utils/sql-execute-utils');

class CodeData {
  // SELECT
  async getResetCodeByUserId(userId) {
    return await sqlExecute.selectOne(
      'SELECT user_id, code, created_at FROM reset_codes WHERE user_id = ? LIMIT 1',
      [userId]
    );
  }

  async getResetCodeByCode(resetCode) {
    return await sqlExecute.selectOne(
      'SELECT user_id, code, created_at ' +
        'FROM reset_codes ' +
        'WHERE code = ? ' +
        'AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE) ' +
        'LIMIT 1',
      [resetCode]
    );
  }

  // INSERT
  async createResetCode(userId, resetCode) {
    return await sqlExecute.exec(
      'INSERT INTO reset_codes (user_id, code) VALUES (?, ?)',
      [userId, resetCode]
    );
  }

  // UPDATE
  async updateResetCode(userId, resetCode) {
    return await sqlExecute.execAffected(
      'UPDATE reset_codes SET created_at = now(), code = ? WHERE user_id = ?',
      [resetCode, userId]
    );
  }

  // DELETE
  async deleteResetCode(resetCode) {
    return await sqlExecute.execAffected(
      'DELETE FROM reset_codes WHERE code = ?',
      [resetCode]
    );
  }
}

module.exports = new CodeData();
