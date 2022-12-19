const { Router } = require("express");
const {
  loginManager,
  logoutManager,
  getManagerProfile,
  createNewDepartment,
  createNewOperator,
  assignTask,
  assignedTask,
  notAssignedTask,
  inProgressTask,
  completedTask,
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
managerRouter.post("/assignTask/:id", requireManagerAuth, assignTask);
managerRouter.get("/assignedTask", requireManagerAuth, assignedTask);
managerRouter.get("/notAssignedTask", requireManagerAuth, notAssignedTask);
managerRouter.get("/inProgressTask", requireManagerAuth, inProgressTask);
managerRouter.get("/completedTask", requireManagerAuth, completedTask);
module.exports = managerRouter;
