const mysql = require("mysql2");
const essentials = require("./sqlQueries");

// const connection = mysql.createConnection({
//   host: process.env.DBHOST,
//   user: process.env.DBUSER,
//   password: process.env.DBPASSWORD,
//   database: process.env.DBNAME,
// });

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
});

pool.getConnection((err) => {
  if (err) throw err;
  console.log("Connected to SQL database...");

  essentials.forEach((item) => {
    pool.query(item);
  });
});

module.exports = pool;
