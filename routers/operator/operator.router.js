const { Router } = require("express");
const {
  loginOperator,
  logoutOperator,
  getOperatorProfile,
} = require("../../controller/operator.controller");
const {
  requireOperatorAuth,
} = require("../../middleware/operatorAuth.middleware");

const operatorRouter = Router();

operatorRouter.get("/profile", requireOperatorAuth, getOperatorProfile);
operatorRouter.post("/login", loginOperator);
operatorRouter.get("/logout", logoutOperator);

module.exports = operatorRouter;
