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
} = require("../../controller/admin.controller");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const reportsRouter = require("../reports/reports.router");

const adminRouter = Router();

adminRouter.use("/reports", requireAdminAuth, reportsRouter);
adminRouter.get("/getClientProfilePic/:clientId", getClientProfilePic);
adminRouter.get("/getManagerProfilePic/:managerId", getManagerProfilePic);
adminRouter.get("/getOperatorProfilePic/:operatorId", getOperatorProfilePic);
adminRouter.post("/addAdmin", requireAdminAuth, createNewAdmin);
adminRouter.post("/addManager", requireAdminAuth, createNewManager);
adminRouter.post("/addOperator", requireAdminAuth, createNewOperator);
adminRouter.post("/deleteOperator", requireAdminAuth, deleteOperator);
adminRouter.get("/getOperators", requireAdminAuth, getOperators);
adminRouter.get("/getDepartments", requireAdminAuth, getDepartments);
adminRouter.get("/getManagers", requireAdminAuth, getManagers);
adminRouter.get("/getClients", requireAdminAuth, getClients);
adminRouter.post("/addClient", requireAdminAuth, createNewClient);
adminRouter.get("/profile", requireAdminAuth, getAdminProfile);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/logout", logoutAdmin);
module.exports = adminRouter;
