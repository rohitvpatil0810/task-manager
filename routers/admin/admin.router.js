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
} = require("../../controller/admin.controller");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");

const adminRouter = Router();

adminRouter.post("/addAdmin", requireAdminAuth, createNewAdmin);
adminRouter.post("/addManager", requireAdminAuth, createNewManager);
adminRouter.post("/addOperator", requireAdminAuth, createNewOperator);
adminRouter.get("/getOperators", requireAdminAuth, getOperators);
adminRouter.get("/getDepartments", requireAdminAuth, getDepartments);
adminRouter.get("/getManagers", requireAdminAuth, getManagers);
adminRouter.get("/getClients", requireAdminAuth, getClients);
adminRouter.post("/addClient", requireAdminAuth, createNewClient);
adminRouter.get("/profile", requireAdminAuth, getAdminProfile);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/logout", logoutAdmin);

module.exports = adminRouter;
