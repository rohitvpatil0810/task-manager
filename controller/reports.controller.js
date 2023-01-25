const db = require("../database/db");
module.exports.clientReports = async (req, res) => {
  const clientId = req.params.clientId;
  const { startDate, endDate } = req.body;
  sqlQuery =
    "SELECT taskName, t.openDate, assignationDate, operatorAcceptDate, actualCloseDate, t.closeDate, AssignationStatus, taskStatus FROM client NATURAL JOIN task NATURAL JOIN taskTimeline t  WHERE clientId = ? AND t.openDate BETWEEN ? AND ?";
  db.query(sqlQuery, [clientId, startDate, endDate], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error,
      });
    } else {
      res.status(200).json({
        success: true,
        result,
      });
    }
  });
};

module.exports.operatorReports = async (req, res) => {
  const operatorId = req.params.operatorId;
  const { startDate, endDate } = req.body;
  sqlQuery =
    "SELECT taskName, t.openDate, assignationDate, operatorAcceptDate, actualCloseDate, t.closeDate, AssignationStatus, taskStatus FROM operator NATURAL JOIN task NATURAL JOIN taskTimeline t  WHERE operatorId = ? AND t.openDate BETWEEN ? AND ?";
  db.query(sqlQuery, [operatorId, startDate, endDate], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error,
      });
    } else {
      res.status(200).json({
        success: true,
        result,
      });
    }
  });
};

module.exports.managerReports = async (req, res) => {
  const managerId = req.params.managerId;
  const { startDate, endDate } = req.body;
  sqlQuery =
    "SELECT taskName, t.openDate, assignationDate, operatorAcceptDate, actualCloseDate, t.closeDate, AssignationStatus, taskStatus FROM manager NATURAL JOIN task NATURAL JOIN taskTimeline t  WHERE managerId = ? AND t.openDate BETWEEN ? AND ?";
  db.query(sqlQuery, [managerId, startDate, endDate], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error,
      });
    } else {
      res.status(200).json({
        success: true,
        result,
      });
    }
  });
};

module.exports.departmentReports = async (req, res) => {
  const departmentId = req.params.departmentId;
  const { startDate, endDate } = req.body;
  sqlQuery =
    "SELECT taskName, t.openDate, assignationDate, operatorAcceptDate, actualCloseDate, t.closeDate, AssignationStatus, taskStatus FROM department NATURAL JOIN operator NATURAL JOIN task NATURAL JOIN taskTimeline t  WHERE departmentId = ? AND t.openDate BETWEEN ? AND ?";
  db.query(sqlQuery, [departmentId, startDate, endDate], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error,
      });
    } else {
      res.status(200).json({
        success: true,
        result,
      });
    }
  });
};
