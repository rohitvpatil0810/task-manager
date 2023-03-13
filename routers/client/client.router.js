const { Router } = require("express");
const {
  getManagerProfilePic,
} = require("../../controller/admin/manager.admin.controller");
const {
  getOperatorProfilePic,
} = require("../../controller/admin/operator.admin.controller");
const {
  loginClient,
  logoutClient,
  getClientProfile,
  createTask,
  trackYourTask,
  clientApproval,
  rejectTaskByClient,
  getTaskTimelineByTaskId,
  attachDocumentsByTaskId,
  getAttachmentsByTaskId,
  getOperatorByOperatorId,
  getManagerByManagerId,
  uploadProfilePic,
  getProfilePic,
  getProjects,
  getProjectbyProjectId,
  getProjectIcon,
} = require("../../controller/client.controller");
const { requireClientAuth } = require("../../middleware/clientAuth.middleware");

const clientRouter = Router();

clientRouter.get("/getProjects", requireClientAuth, getProjects);
clientRouter.get(
  "/getProject/:projectId",
  requireClientAuth,
  getProjectbyProjectId
);
clientRouter.get("/getProjectIcon/:projectId", getProjectIcon);
clientRouter.post("/profilePic", requireClientAuth, uploadProfilePic);
clientRouter.get("/profilePic", requireClientAuth, getProfilePic);
clientRouter.get("/profile", requireClientAuth, getClientProfile);
clientRouter.post("/login", loginClient);
clientRouter.get("/logout", logoutClient);
clientRouter.post("/createTask", requireClientAuth, createTask);
clientRouter.get("/trackYourTask", requireClientAuth, trackYourTask);
clientRouter.get(
  "/getAttachments/:taskId",
  requireClientAuth,
  getAttachmentsByTaskId
);
clientRouter.post("/attachFiles/:taskId", attachDocumentsByTaskId);
clientRouter.get(
  "/getTimeline/:taskId",
  requireClientAuth,
  getTaskTimelineByTaskId
);
clientRouter.post("/approveTask/:id", requireClientAuth, clientApproval);
clientRouter.post("/rejectTask/:id", requireClientAuth, rejectTaskByClient);

clientRouter.get("/getOperatorProfilePic/:operatorId", getOperatorProfilePic);
clientRouter.get(
  "/getOperator/:operatorId",
  requireClientAuth,
  getOperatorByOperatorId
);
clientRouter.get("getManagerProfilePic/:managerId", getManagerProfilePic);
clientRouter.get(
  "/getManager/:managerId",
  requireClientAuth,
  getManagerByManagerId
);

module.exports = clientRouter;
