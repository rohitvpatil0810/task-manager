const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to SQL database...");
});

module.exports = connection;
