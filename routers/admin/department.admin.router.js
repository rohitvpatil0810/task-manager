const { Router } = require("express");
const departmentAdminController = require("../../controller/admin/department.admin.controller");
const departmentAdminRouter = Router();

departmentAdminRouter.post(
  "/addDepartment",
  requireAdminAuth,
  departmentAdminController.addDepartment
);
departmentAdminRouter.post(
  "/editDepartment/:departmentId",
  requireAdminAuth,
  departmentAdminController.editDepartment
);
departmentAdminRouter.get(
  "/getDepartments",
  requireAdminAuth,
  departmentAdminController.getDepartments
);

module.exports = departmentAdminRouter;
