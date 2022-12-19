const { Router } = require("express");
const {
  loginManager,
  logoutManager,
  getManagerProfile,
  createNewDepartment,
  createNewOperator,
  acceptTask,
} = require("../../controller/manager.controller");
const {
  requireManagerAuth,
} = require("../../middleware/managerAuth.middleware");

const managerRouter = Router();

managerRouter.post("/addDepartment", requireManagerAuth, createNewDepartment);
managerRouter.post("/addOperator", requireManagerAuth, createNewOperator);
managerRouter.get("/profile", requireManagerAuth, getManagerProfile);
managerRouter.post("/login", loginManager);
managerRouter.get("/logout", logoutManager);
managerRouter.post("/acceptTask/:id", acceptTask);

module.exports = managerRouter;
