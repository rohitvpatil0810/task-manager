const { Router } = require("express");
const db = require("../database/db");
const adminRouter = require("./admin/admin.router");
const clientRouter = require("./client/client.router");
const managerRouter = require("./manager/manager.router");
const operatorRouter = require("./operator/operator.router");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json");
const router = Router();

router.use(
  "/admin",
  // #swagger.tags = ['Admin']
  adminRouter
);
router.use(
  "/manager",
  // #swagger.tags = ['Manager']
  managerRouter
);
router.use(
  "/client",
  // #swagger.tags = ['Client']
  clientRouter
);
router.use(
  "/operator",
  // #swagger.tags = ['Operator']
  operatorRouter
);

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

router.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

module.exports = router;
