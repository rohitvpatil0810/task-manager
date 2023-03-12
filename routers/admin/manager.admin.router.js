const { Router } = require("express");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const managerAdminController = require("../../controller/admin/manager.admin.controller");
const managerAdminRouter = Router();

managerAdminRouter.get(
  "/getManagerProfilePic/:managerId",
  managerAdminController.getManagerProfilePic
);
managerAdminRouter.post(
  "/addManager",
  requireAdminAuth,
  managerAdminController.createNewManager
);
managerAdminRouter.get(
  "/deleteManager/:managerId",
  requireAdminAuth,
  managerAdminController.deleteManager
);
managerAdminRouter.get(
  "/activateManager/:managerId",
  requireAdminAuth,
  managerAdminController.activateManager
);
managerAdminRouter.get(
  "/getManagers",
  requireAdminAuth,
  managerAdminController.getManagers
);
managerAdminRouter.get(
  "/getDeactivatedManagers",
  requireAdminAuth,
  managerAdminController.getDeactivatedManagers
);
managerAdminRouter.post(
  "/editManager/:managerId",
  requireAdminAuth,
  managerAdminController.editManager
);

module.exports = managerAdminRouter;
