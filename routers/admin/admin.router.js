const { Router } = require("express");
const {
  createNewAdmin,
  loginAdmin,
} = require("../../controller/admin.controller");

const adminRouter = Router();

adminRouter.post("/addAdmin", createNewAdmin);
adminRouter.post("/login", loginAdmin);

module.exports = adminRouter;
