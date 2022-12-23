const { Router } = require("express");
const {
  loginOperator,
  logoutOperator,
  getOperatorProfile,
  changeTaskStatus,
  taskByOperatorId,
  getTaskTimelineByTaskId,
  getAttachmentsByTaskId,
} = require("../../controller/operator.controller");
const {
  requireOperatorAuth,
} = require("../../middleware/operatorAuth.middleware");

const operatorRouter = Router();

operatorRouter.get("/profile", requireOperatorAuth, getOperatorProfile);
operatorRouter.post("/login", loginOperator);
operatorRouter.get("/logout", logoutOperator);
operatorRouter.get("/taskByOperatorId", requireOperatorAuth, taskByOperatorId);
operatorRouter.get(
  "/getTimeline/:taskId",
  requireOperatorAuth,
  getTaskTimelineByTaskId
);
operatorRouter.get(
  "/getAttachments/:taskId",
  requireOperatorAuth,
  getAttachmentsByTaskId
);
operatorRouter.post(
  "/changeTaskStatus/:id",
  requireOperatorAuth,
  changeTaskStatus
);

module.exports = operatorRouter;
