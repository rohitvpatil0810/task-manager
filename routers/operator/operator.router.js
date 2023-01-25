const { Router } = require("express");
const {
  loginOperator,
  logoutOperator,
  getOperatorProfile,
  changeTaskStatus,
  taskByOperatorId,
  getTaskTimelineByTaskId,
  getAttachmentsByTaskId,
  getManagerByManagerId,
  getClientByClientId,
  acceptTask,
  uploadProfilePic,
  getProfilePic,
} = require("../../controller/operator.controller");
const {
  requireOperatorAuth,
} = require("../../middleware/operatorAuth.middleware");

const operatorRouter = Router();

operatorRouter.post("/profilePic", requireOperatorAuth, uploadProfilePic);
operatorRouter.get("/profilePic", requireOperatorAuth, getProfilePic);
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

operatorRouter.post("/acceptTask/:id", requireOperatorAuth, acceptTask);

operatorRouter.post(
  "/changeTaskStatus/:id",
  requireOperatorAuth,
  changeTaskStatus
);

operatorRouter.get(
  "/getManager/:managerId",
  requireOperatorAuth,
  getManagerByManagerId
);

operatorRouter.get(
  "/getClient/:clientId",
  requireOperatorAuth,
  getClientByClientId
);

module.exports = operatorRouter;
