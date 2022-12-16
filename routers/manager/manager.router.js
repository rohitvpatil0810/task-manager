const { Router } = require("express");
const {
  loginManager,
  logoutManager,
} = require("../../controller/manager.controller");

const managerRouter = Router();

managerRouter.post("/login", loginManager);
managerRouter.get("/logout", logoutManager);

module.exports = managerRouter;
