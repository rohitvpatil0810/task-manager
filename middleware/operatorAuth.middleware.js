const jwt = require("jsonwebtoken");
const db = require("../database/db");

const requireOperatorAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async (error, decodedToken) => {
      if (error) {
        res.status(401).json({
          success: false,
          error: "Operator is not authenticated.",
        });
      } else {
        let sqlQuery =
          "SELECT * FROM operator WHERE operatorId = ? AND active = 'Active'";
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
              error: "Operator is not authenticated.",
            });
          } else {
            req.operator = result[0];
            next();
          }
        });
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: "Operator is not authenticated.",
    });
  }
};

module.exports = { requireOperatorAuth };
