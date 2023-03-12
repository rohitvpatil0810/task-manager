const { Router } = require("express");
const {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
} = require("../../controller/admin/admin.controller");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const reportsRouter = require("../reports/reports.router");
const clientAdminRouter = require("./client.admin.router");
const managerAdminRouter = require("./manager.admin.router");
const operatorAdminRouter = require("./operator.admin.router");
const projectAdminRouter = require("./project.admin.router");

const adminRouter = Router();

adminRouter.use("/reports", requireAdminAuth, reportsRouter);
adminRouter.use(projectAdminRouter);
adminRouter.use(operatorAdminRouter);
adminRouter.use(managerAdminRouter);
adminRouter.use(clientAdminRouter);

// admin routes for login and logout
adminRouter.get("/profile", requireAdminAuth, getAdminProfile);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/logout", logoutAdmin);

module.exports = adminRouter;
