const { Router } = require("express");
const db = require("../database/db");
const adminRouter = require("./admin/admin.router");
const clientRouter = require("./client/client.router");
const managerRouter = require("./manager/manager.router");
const operatorRouter = require("./operator/operator.router");
const jwt = require("jsonwebtoken");

const router = Router();

router.use("/admin", adminRouter);
router.use("/manager", managerRouter);
router.use("/client", clientRouter);
router.use("/operator", operatorRouter);

router.post("/getAuth", (req, res) => {
  let { token, userType } = req.body;
  token = token.slice(4, token.indexOf(";"));
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async (error, decodedToken) => {
      if (error) {
        res.status(401).json({
          success: false,
          error: "Session Expired.",
        });
      } else {
        let sqlQuery = "";
        let field = "";
        if (userType == "admin") {
          sqlQuery = "SELECT * FROM " + userType + " WHERE id = ?";
        } else {
          sqlQuery =
            "SELECT * FROM " + userType + " WHERE " + userType + "Id = ?";
        }
        db.query(sqlQuery, [decodedToken.id], (error, result) => {
          if (error) {
            res.status(502).json({
              success: false,
              log: "Internal Server Error.",
              error,
            });
            return;
          }
          if (result.length == 0) {
            res.status(401).json({
              success: false,
              error: "User Is Not Authenticated",
            });
          } else {
            res.status(200).json({
              success: true,
              userType,
            });
          }
        });
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: "User Is Not Authenticated",
    });
  }
});

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: "Welcome to backend of Task Manager.",
  });
});

module.exports = router;
