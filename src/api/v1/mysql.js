const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err.code, err.message || err.sqlMessage);
  
    return;
  }

  connection.ping((pingErr) => {
    if (pingErr) {
      console.error('MySQL ping error:', pingErr.code, pingErr.message || pingErr.sqlMessage);
    }

    connection.release();
  });
});

module.exports = pool.promise();