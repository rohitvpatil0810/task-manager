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
  getManagerProfilePic,
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
} = require("../../controller/admin.controller");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const reportsRouter = require("../reports/reports.router");

const adminRouter = Router();

adminRouter.use("/reports", requireAdminAuth, reportsRouter);

// project routes
adminRouter.post("/addProject", requireAdminAuth, createNewProject);
adminRouter.get("/deleteProject/:projectId", requireAdminAuth, deleteProject);
adminRouter.get(
  "/activateProject/:projectId",
  requireAdminAuth,
  activateProject
);
adminRouter.get("/getProjects", requireAdminAuth, getProjects);
adminRouter.get(
  "/getDeactivatedProjects",
  requireAdminAuth,
  getDeactivatedProjects
);
adminRouter.get("/getProjectIcon/:projectId", getProjectIcon);

// profile images routes
adminRouter.get("/getClientProfilePic/:clientId", getClientProfilePic);
adminRouter.get("/getManagerProfilePic/:managerId", getManagerProfilePic);
adminRouter.get("/getOperatorProfilePic/:operatorId", getOperatorProfilePic);

// adding and deleting users routes
adminRouter.post("/addAdmin", requireAdminAuth, createNewAdmin);
adminRouter.post("/addManager", requireAdminAuth, createNewManager);
adminRouter.get("/deleteManager/:managerId", requireAdminAuth, deleteManager);
adminRouter.get(
  "/activateManager/:managerId",
  requireAdminAuth,
  activateManager
);
adminRouter.post("/addOperator", requireAdminAuth, createNewOperator);
adminRouter.get(
  "/deleteOperator/:operatorId",
  requireAdminAuth,
  deleteOperator
);
adminRouter.get(
  "/activateOperator/:operatorId",
  requireAdminAuth,
  activateOperator
);
adminRouter.post("/addClient", requireAdminAuth, createNewClient);
adminRouter.get("/deleteClient/:clientId", requireAdminAuth, deleteClient);
adminRouter.get("/activateClient/:clientId", requireAdminAuth, activateClient);

//  list of active and deleted users routes
adminRouter.get("/getOperators", requireAdminAuth, getOperators);
adminRouter.get(
  "/getDeactivatedOperators",
  requireAdminAuth,
  getDeactivatedOperators
);
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

// admin routes for login and logout
adminRouter.get("/profile", requireAdminAuth, getAdminProfile);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/logout", logoutAdmin);
module.exports = adminRouter;
