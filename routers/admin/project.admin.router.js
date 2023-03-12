const { Router } = require("express");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const projectAdminController = require("../../controller/admin/project.admin.controller");
const projectAdminRouter = Router();

// project routes
projectAdminRouter.post(
  "/addProject",
  requireAdminAuth,
  projectAdminController.createNewProject
);
projectAdminRouter.get(
  "/deleteProject/:projectId",
  requireAdminAuth,
  projectAdminController.deleteProject
);
projectAdminRouter.get(
  "/activateProject/:projectId",
  requireAdminAuth,
  projectAdminController.activateProject
);
projectAdminRouter.get(
  "/getProjects",
  requireAdminAuth,
  projectAdminController.getProjects
);
projectAdminRouter.get(
  "/getDeactivatedProjects",
  requireAdminAuth,
  projectAdminController.getDeactivatedProjects
);
projectAdminRouter.get(
  "/getProjectIcon/:projectId",
  projectAdminController.getProjectIcon
);
projectAdminRouter.post(
  "/editProject/:projectId",
  requireAdminAuth,
  projectAdminController.editProject
);

module.exports = projectAdminRouter;
