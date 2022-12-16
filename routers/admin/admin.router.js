const { Router } = require("express");
const {
  createNewAdmin,
  loginAdmin,
  logoutAdmin,
} = require("../../controller/admin.controller");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");

const adminRouter = Router();

adminRouter.post("/addAdmin", requireAdminAuth, createNewAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/logout", logoutAdmin);

module.exports = adminRouter;
