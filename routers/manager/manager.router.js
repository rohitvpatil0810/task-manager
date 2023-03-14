const { Router } = require("express");
const {
  getClientProfilePic,
} = require("../../controller/admin/client.admin.controller");
const {
  editDepartment,
  addDepartment,
} = require("../../controller/admin/department.admin.controller");
const {
  getOperatorProfilePic,
  editOperator,
  createNewOperator,
} = require("../../controller/admin/operator.admin.controller");
const {
  loginManager,
  logoutManager,
  getManagerProfile,
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
  getProjectbyProjectId,
  getProjects,
  getProjectIcon,
} = require("../../controller/manager.controller");
const {
  requireManagerAuth,
} = require("../../middleware/managerAuth.middleware");

const managerRouter = Router();

// projects

managerRouter.get("/getProjects", requireManagerAuth, getProjects);
managerRouter.get(
  "/getProject/:projectId",
  requireManagerAuth,
  getProjectbyProjectId
);
managerRouter.get("/getProjectIcon/:projectId", getProjectIcon);

managerRouter.post("/profilePic", requireManagerAuth, uploadProfilePic);
managerRouter.get("/profilePic", requireManagerAuth, getProfilePic);
managerRouter.post("/addDepartment", requireManagerAuth, addDepartment);
managerRouter.post("/addOperator", requireManagerAuth, createNewOperator);
managerRouter.get(
  "/deleteOperator/:operatorId",
  requireManagerAuth,
  deleteOperator
);
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

managerRouter.post("/editOpertor", requireManagerAuth, edi);

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
managerRouter.post(
  "/editDepartment/:departmentId",
  requireManagerAuth,
  editDepartment
);
module.exports = managerRouter;
