const sqlExecute = require('../utils/sql-execute-utils');

class UserData {
  // SELECT
  async getUserById(userId) {
    return await sqlExecute.selectOne(
      'SELECT id, user_name, email, password FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
  }

  async getUserByName(userName) {
    return await sqlExecute.selectOne(
      'SELECT id, user_name, email, password FROM users WHERE user_name = ? LIMIT 1',
      [userName]
    );
  }

  async getUserByEmail(userEmail) {
    return await sqlExecute.selectOne(
      'SELECT id, user_name, email, password FROM users WHERE email = ? LIMIT 1',
      [userEmail]
    );
  }

  async getUserByActivationCode(activationCode) {
    const sql =
      'SELECT u.id, u.is_activation_status ' +
      'FROM users AS u ' +
      'INNER JOIN activation_codes AS a ON u.id = a.user_id ' +
      'WHERE a.code = ? ' +
      'AND a.activation_date IS NULL ' +
      'LIMIT 1';

    return await sqlExecute.selectOne(sql, [activationCode]);
  }

  async getAllUsers() {
    return await sqlExecute.selectMany('SELECT * FROM users');
  }

  async getUserRoles(userId) {
    const sql =
      'SELECT s.identifier ' +
      'FROM user_roles AS u ' +
      'INNER JOIN roles AS s ' +
      'WHERE u.site_role_id = s.id ' +
      'AND u.user_id = ?';

    return await sqlExecute.selectMany(sql, [userId]);
  }

  // INSERT
  async createUser(userData) {
    const user = await sqlExecute.exec(
      'INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)',
      [userData.userName, userData.email, userData.password]
    );

    const userId = user.insertId;

    await sqlExecute.exec('INSERT INTO user_roles (user_id) VALUES (?)', [
      userId
    ]);

    return user;
  }

  async createUserActivationCode(userId, activationCode) {
    return await sqlExecute.exec(
      'INSERT INTO activation_codes (user_id, code) VALUES (?, ?)',
      [userId, activationCode]
    );
  }

  // UPDATE
  async updateUserPassword(userID, password) {
    return await sqlExecute.execAffected(
      'UPDATE users SET password = ? WHERE users.id = ?',
      [password, userID]
    );
  }

  async updateUserActivationStatus(userId) {
    const sql =
      'UPDATE users, activation_codes ' +
      'SET users.is_activation_status = ?, ' +
      'activation_codes.activation_date = now() ' +
      'WHERE users.id = ? ' +
      'AND activation_codes.user_id = ?';

    return await sqlExecute.execAffected(sql, [1, userId, userId]);
  }
}

module.exports = new UserData();
