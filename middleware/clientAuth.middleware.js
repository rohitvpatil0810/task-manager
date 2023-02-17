const jwt = require("jsonwebtoken");
const db = require("../database/db");

const requireClientAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async (error, decodedToken) => {
      if (error) {
        res.status(401).json({
          success: false,
          error: "Client is not authenticated.",
        });
      } else {
        let sqlQuery =
          "SELECT * FROM client WHERE clientId = ? where active = 'Active'";
        db.query(sqlQuery, [decodedToken.id], (error, result) => {
          if (error) {
            res.status(502).json({
              success: false,
              error: "Internal Server Error.",
            });
            return;
          }
          if (result.length == 0) {
            res.status(401).json({
              success: false,
              error: "Client is not authenticated.",
            });
          } else {
            req.client = result[0];
            next();
          }
        });
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: "Client is not authenticated.",
    });
  }
};

module.exports = { requireClientAuth };
