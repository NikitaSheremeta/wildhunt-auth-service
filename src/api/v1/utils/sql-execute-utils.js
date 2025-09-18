const mysql = require('../mysql');

class sqlExecute {
  async selectOne(sql, params = []) {
    const [rows] = await mysql.execute(sql, params);

    return rows.length > 0 ? rows[0] : false;
  }

  async selectMany(sql, params = []) {
    const [rows] = await mysql.execute(sql, params);

    return rows.length > 0 ? rows : false;
  }

  async exec(sql, params = []) {
    const [result] = await mysql.execute(sql, params);

    return result;
  }

  async execAffected(sql, params = []) {
    const [result] = await mysql.execute(sql, params);

    return result.affectedRows;
  }
}

module.exports = new sqlExecute();
