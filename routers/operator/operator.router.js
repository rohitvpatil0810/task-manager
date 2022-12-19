const { Router } = require("express");
const {
  loginOperator,
  logoutOperator,
  getOperatorProfile,
  changeTaskStatus,
} = require("../../controller/operator.controller");
const {
  requireOperatorAuth,
} = require("../../middleware/operatorAuth.middleware");

const operatorRouter = Router();

operatorRouter.get("/profile", requireOperatorAuth, getOperatorProfile);
operatorRouter.post("/login", loginOperator);
operatorRouter.get("/logout", logoutOperator);
operatorRouter.post(
  "/changeTaskStatus/:id",
  requireOperatorAuth,
  changeTaskStatus
);

module.exports = operatorRouter;
