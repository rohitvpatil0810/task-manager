const { Router } = require("express");
const {
  loginOperator,
  logoutOperator,
  getOperatorProfile,
  changeTaskStatus,
  taskByOperatorId,
} = require("../../controller/operator.controller");
const {
  requireOperatorAuth,
} = require("../../middleware/operatorAuth.middleware");

const operatorRouter = Router();

operatorRouter.get("/profile", requireOperatorAuth, getOperatorProfile);
operatorRouter.post("/login", loginOperator);
operatorRouter.get("/logout", logoutOperator);
operatorRouter.get("/taskByOperatorId", requireOperatorAuth, taskByOperatorId);
operatorRouter.post(
  "/changeTaskStatus/:id",
  requireOperatorAuth,
  changeTaskStatus
);

module.exports = operatorRouter;
