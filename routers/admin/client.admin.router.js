const { Router } = require("express");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const clientAdminController = require("../../controller/admin/client.admin.controller");
const clientAdminRouter = Router();

clientAdminRouter.post(
  "/addAdmin",
  requireAdminAuth,
  clientAdminController.createNewAdmin
);
clientAdminRouter.get(
  "/getClientProfilePic/:clientId",
  clientAdminController.getClientProfilePic
);
clientAdminRouter.post(
  "/addClient",
  requireAdminAuth,
  clientAdminController.createNewClient
);
clientAdminRouter.get(
  "/deleteClient/:clientId",
  requireAdminAuth,
  clientAdminController.deleteClient
);
clientAdminRouter.get(
  "/activateClient/:clientId",
  requireAdminAuth,
  clientAdminController.activateClient
);
clientAdminRouter.get(
  "/getClients",
  requireAdminAuth,
  clientAdminController.getClients
);
clientAdminRouter.get(
  "/getDeactivatedClients",
  requireAdminAuth,
  clientAdminController.getDeactivatedClients
);
clientAdminRouter.post(
  "/editClient/:clientId",
  requireAdminAuth,
  clientAdminController.editClient
);

module.exports = clientAdminRouter;
