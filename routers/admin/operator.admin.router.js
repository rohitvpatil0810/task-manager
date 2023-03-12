const { Router } = require("express");
const { requireAdminAuth } = require("../../middleware/adminAuth.middleware");
const operatorAdminController = require("../../controller/admin/operator.admin.controller");
const operatorAdminRouter = Router();

operatorAdminRouter.get(
  "/getOperatorProfilePic/:operatorId",
  operatorAdminController.getOperatorProfilePic
);
operatorAdminRouter.post(
  "/addOperator",
  requireAdminAuth,
  operatorAdminController.createNewOperator
);
operatorAdminRouter.get(
  "/deleteOperator/:operatorId",
  requireAdminAuth,
  operatorAdminController.deleteOperator
);
operatorAdminRouter.get(
  "/activateOperator/:operatorId",
  requireAdminAuth,
  operatorAdminController.activateOperator
);
operatorAdminRouter.get(
  "/getOperators",
  requireAdminAuth,
  operatorAdminController.getOperators
);
operatorAdminRouter.get(
  "/getDeactivatedOperators",
  requireAdminAuth,
  operatorAdminController.getDeactivatedOperators
);
operatorAdminRouter.post(
  "/editOperator/:operatorId",
  requireAdminAuth,
  operatorAdminController.editOperator
);

module.exports = operatorAdminRouter;
