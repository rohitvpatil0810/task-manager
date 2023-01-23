const { Router } = require("express");
const {
  clientReports,
  operatorReports,
  managerReports,
  departmentReports,
} = require("../../controller/reports.controller");

const reportsRouter = Router();
const db = require("../../database/db");
// client Wise
// Task type wise
// department wise
// date wise
// task category wise
// inProgress Assigned NotAssigned Finished
// No. Of Total Tasks

reportsRouter.post("/clientReports/:clientId", clientReports);

reportsRouter.post("/operatorReports/:operatorId", operatorReports);

reportsRouter.post("/managerReports/:managerId", managerReports);

reportsRouter.post("/departmentReports/:departmentId", departmentReports);

module.exports = reportsRouter;
