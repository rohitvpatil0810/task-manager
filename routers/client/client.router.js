const { Router } = require("express");
const {
  loginClient,
  logoutClient,
  getClientProfile,
  createTask,
  trackYourTask,
  clientApproval,
  rejectTaskByClient,
} = require("../../controller/client.controller");
const { requireClientAuth } = require("../../middleware/clientAuth.middleware");

const clientRouter = Router();

clientRouter.get("/profile", requireClientAuth, getClientProfile);
clientRouter.post("/login", loginClient);
clientRouter.get("/logout", logoutClient);
clientRouter.post("/createTask", requireClientAuth, createTask);
clientRouter.get("/trackYourTask", requireClientAuth, trackYourTask);
clientRouter.post("/approveTask/:id", requireClientAuth, clientApproval);
clientRouter.post("/rejectTask/:id", requireClientAuth, rejectTaskByClient);

module.exports = clientRouter;
