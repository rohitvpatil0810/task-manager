const mysql = require("mysql2");
const { forEach } = require("./sqlQueries");
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

  essentials.forEach((item) => {
    connection.query(item);
  });
});

module.exports = connection;
