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
const managerAdminContoller = require("../../controller/admin/manager.admin.controller");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const reportsRouter = require("../reports/reports.router");
const operatorAdminRouter = require("./operator.admin.router");
const projectAdminRouter = require("./project.admin.router");

const adminRouter = Router();

adminRouter.use("/reports", requireAdminAuth, reportsRouter);
adminRouter.use(projectAdminRouter);
adminRouter.use(operatorAdminRouter);

// profile images routes
adminRouter.get("/getClientProfilePic/:clientId", getClientProfilePic);
adminRouter.get(
  "/getManagerProfilePic/:managerId",
  managerAdminContoller.getManagerProfilePic
);

// adding and deleting users routes
adminRouter.post("/addAdmin", requireAdminAuth, createNewAdmin);
adminRouter.post("/addManager", requireAdminAuth, createNewManager);
adminRouter.get("/deleteManager/:managerId", requireAdminAuth, deleteManager);
adminRouter.get(
  "/activateManager/:managerId",
  requireAdminAuth,
  activateManager
);

adminRouter.post("/addClient", requireAdminAuth, createNewClient);
adminRouter.get("/deleteClient/:clientId", requireAdminAuth, deleteClient);
adminRouter.get("/activateClient/:clientId", requireAdminAuth, activateClient);

//  list of active and deleted users routes

adminRouter.get("/getDepartments", requireAdminAuth, getDepartments);
adminRouter.get("/getManagers", requireAdminAuth, getManagers);
adminRouter.get(
  "/getDeactivatedManagers",
  requireAdminAuth,
  getDeactivatedManagers
);
adminRouter.get("/getClients", requireAdminAuth, getClients);
adminRouter.get(
  "/getDeactivatedClients",
  requireAdminAuth,
  getDeactivatedClients
);

//admin routes for editing users

adminRouter.post("/editManager/:managerId", requireAdminAuth, editManager);
adminRouter.post("/editClient/:clientId", requireAdminAuth, editClient);

//admin Routes for departments
adminRouter.post("/addDepartment", requireAdminAuth, addDepartment);
adminRouter.post(
  "/editDepartment/:departmentId",
  requireAdminAuth,
  editDepartment
);

// admin routes for login and logout
adminRouter.get("/profile", requireAdminAuth, getAdminProfile);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/logout", logoutAdmin);
module.exports = adminRouter;
