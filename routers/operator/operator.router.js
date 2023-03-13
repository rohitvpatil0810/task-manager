const { Router } = require("express");
const {
  getClientProfilePic,
} = require("../../controller/admin/client.admin.controller");
const {
  getManagerProfilePic,
} = require("../../controller/admin/manager.admin.controller");
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
  getProjectbyProjectId,
  getProjectIcon,
} = require("../../controller/operator.controller");
const {
  requireOperatorAuth,
} = require("../../middleware/operatorAuth.middleware");

const operatorRouter = Router();

// projects
operatorRouter.get(
  "/getProject/:projectId",
  requireOperatorAuth,
  getProjectbyProjectId
);
operatorRouter.get("/getProjectIcon/:projectId", getProjectIcon);

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
operatorRouter.get("/getManagerProfilePic/:managerId", getManagerProfilePic);

operatorRouter.get("/getClientProfilePic/:clientId", getClientProfilePic);

module.exports = operatorRouter;
