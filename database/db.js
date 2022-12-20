const mysql = require("mysql2");
const essentials = require("./sqlQueries");

const connection = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to SQL database...");

  connection.query(essentials[0]);
  connection.query(essentials[1]);
  connection.query(essentials[2]);
  connection.query(essentials[3]);
  connection.query(essentials[4]);
  connection.query(essentials[5]);
  connection.query(essentials[6]);
});

module.exports = connection;
