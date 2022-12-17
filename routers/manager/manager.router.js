const { Router } = require("express");
const {
  loginManager,
  logoutManager,
  getManagerProfile,
  createNewDepartment,
} = require("../../controller/manager.controller");
const {
  requireManagerAuth,
} = require("../../middleware/managerAuth.middleware");

const managerRouter = Router();

managerRouter.post("/addDepartment", requireManagerAuth, createNewDepartment);
managerRouter.get("/profile", requireManagerAuth, getManagerProfile);
managerRouter.post("/login", loginManager);
managerRouter.get("/logout", logoutManager);

module.exports = managerRouter;
