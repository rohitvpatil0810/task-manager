const { Router } = require("express");
const {
  createNewAdmin,
  loginAdmin,
  logoutAdmin,
  createNewManager,
  createNewClient,
  getAdminProfile,
  getManagers,
  getClients,
  createNewOperator,
  getOperators,
  getDepartments,
  getClientProfilePic,
  getOperatorProfilePic,
  deleteOperator,
  createNewProject,
  deleteProject,
  activateProject,
  getDeactivatedOperators,
  getProjects,
  getDeactivatedProjects,
  getProjectIcon,
  deleteClient,
  deleteManager,
  activateManager,
  activateOperator,
  activateClient,
  getDeactivatedManagers,
  getDeactivatedClients,
  editManager,
  editClient,
  editOperator,
  addDepartment,
  editProject,
  editDepartment,
} = require("../../controller/admin/admin.controller");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const reportsRouter = require("../reports/reports.router");
const managerAdminRouter = require("./manager.admin.router");
const operatorAdminRouter = require("./operator.admin.router");
const projectAdminRouter = require("./project.admin.router");

const adminRouter = Router();

adminRouter.use("/reports", requireAdminAuth, reportsRouter);
adminRouter.use(projectAdminRouter);
adminRouter.use(operatorAdminRouter);
adminRouter.use(managerAdminRouter);

adminRouter.get("/getClientProfilePic/:clientId", getClientProfilePic);

adminRouter.post("/addAdmin", requireAdminAuth, createNewAdmin);

adminRouter.post("/addClient", requireAdminAuth, createNewClient);
adminRouter.get("/deleteClient/:clientId", requireAdminAuth, deleteClient);
adminRouter.get("/activateClient/:clientId", requireAdminAuth, activateClient);
adminRouter.get("/getClients", requireAdminAuth, getClients);
adminRouter.get(
  "/getDeactivatedClients",
  requireAdminAuth,
  getDeactivatedClients
);
adminRouter.post("/editClient/:clientId", requireAdminAuth, editClient);

// admin routes for login and logout
adminRouter.get("/profile", requireAdminAuth, getAdminProfile);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/logout", logoutAdmin);
module.exports = adminRouter;
