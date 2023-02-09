const { Router } = require("express");
const {
  getOperatorProfilePic,
  getClientProfilePic,
} = require("../../controller/admin.controller");
const {
  loginManager,
  logoutManager,
  getManagerProfile,
  createNewDepartment,
  createNewOperator,
  assignTask,
  assignedTask,
  notAssignedTask,
  inProgressTask,
  completedTask,
  approveTask,
  getDepartments,
  getOperatorsByDepartment,
  rejectTask,
  getTaskTimelineByTaskId,
  getAttachmentsByTaskId,
  createTask,
  getClients,
  attachDocumentsByTaskId,
  getTasks,
  getOperatorByOperatorId,
  getClientByClientId,
  uploadProfilePic,
  getProfilePic,
  deleteOperator,
} = require("../../controller/manager.controller");
const {
  requireManagerAuth,
} = require("../../middleware/managerAuth.middleware");

const managerRouter = Router();

managerRouter.post("/profilePic", requireManagerAuth, uploadProfilePic);
managerRouter.get("/profilePic", requireManagerAuth, getProfilePic);
managerRouter.post("/addDepartment", requireManagerAuth, createNewDepartment);
managerRouter.post("/addOperator", requireManagerAuth, createNewOperator);
managerRouter.post("/deleteOperator", requireManagerAuth, deleteOperator);
managerRouter.get("/profile", requireManagerAuth, getManagerProfile);
managerRouter.post("/login", loginManager);
managerRouter.get("/logout", logoutManager);
managerRouter.get("/getDepartments", requireManagerAuth, getDepartments);
managerRouter.get(
  "/getOperators/:departmentId",
  requireManagerAuth,
  getOperatorsByDepartment
);

managerRouter.get(
  "/getOperator/:operatorId",
  requireManagerAuth,
  getOperatorByOperatorId
);
managerRouter.get("/getOperatorProfilePic/:operatorId", getOperatorProfilePic);
managerRouter.get(
  "/getClient/:clientId",
  requireManagerAuth,
  getClientByClientId
);
managerRouter.get("/getClientProfilePic/:clientId", getClientProfilePic);
managerRouter.post("/rejectTask/:taskId", requireManagerAuth, rejectTask);
managerRouter.post("/assignTask/:id", requireManagerAuth, assignTask);
managerRouter.post("/createTask", requireManagerAuth, createTask);
managerRouter.get("/getClients", requireManagerAuth, getClients);
managerRouter.get("/getTasks", requireManagerAuth, getTasks);
managerRouter.get("/assignedTask", requireManagerAuth, assignedTask);
managerRouter.get("/notAssignedTask", requireManagerAuth, notAssignedTask);
managerRouter.get("/inProgressTask", requireManagerAuth, inProgressTask);
managerRouter.get("/completedTask", requireManagerAuth, completedTask);
managerRouter.get(
  "/getTimeline/:taskId",
  requireManagerAuth,
  getTaskTimelineByTaskId
);
managerRouter.get(
  "/getAttachments/:taskId",
  requireManagerAuth,
  getAttachmentsByTaskId
);

managerRouter.post(
  "/attachFiles/:taskId",
  requireManagerAuth,
  attachDocumentsByTaskId
);
managerRouter.post("/approveTask/:id", requireManagerAuth, approveTask);
module.exports = managerRouter;
