const connection = require('./mysql-connection');

const db = {
  async selectOne(sql, params = []) {
    const [rows] = await connection.execute(sql, params);

    return rows.length > 0 ? rows[0] : false;
  },

  async selectMany(sql, params = []) {
    const [rows] = await connection.execute(sql, params);

    return rows.length > 0 ? rows : false;
  },

  async exec(sql, params = []) {
    const [result] = await connection.execute(sql, params);

    return result;
  },

  async execAffected(sql, params = []) {
    const [result] = await connection.execute(sql, params);

    return result.affectedRows;
  }
};

module.exports = db;
