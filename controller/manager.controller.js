const { createToken } = require("../utility/createJWToken");
const { checkPassword, hashPassword } = require("../utility/passwordManager");
const db = require("../database/db");
const { generateId } = require("../utility/idGenerator");
const { checkUserData } = require("../utility/checkUserData");
const { response } = require("express");
const maxAge = 3 * 24 * 60 * 60;

// login Manager
module.exports.loginManager = async (req, res) => {
  let { email, password } = req.body;
  let sqlQuery = "SELECT * FROM manager WHERE email = ?";
  let value = [email];
  db.query(sqlQuery, [value], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    }
    if (result.length == 0) {
      res.status(404).json({
        success: false,
        error: "Manager is not registered.",
      });
    } else {
      let id = result[0].managerId;
      let hashPassword = result[0].password;
      let auth = await checkPassword(password, hashPassword);
      if (auth) {
        const token = createToken(id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({
          success: true,
          data: "Logged in successfully.",
        });
      } else {
        res.status(400).json({
          success: false,
          data: "Invalid Credentials.",
        });
      }
    }
  });
};

// get profile of admin
module.exports.getManagerProfile = async (req, res) => {
  const manager = req.manager;
  delete manager.managerId;
  delete manager.password;
  res.status(200).json({ success: true, data: { manager } });
};

// Creating new Department
module.exports.createNewDepartment = async (req, res) => {
  const department = req.body;
  if (!department.name) {
    res.status(400).json({
      success: false,
      error: "Please Enter Department name.",
    });
    return;
  } else {
    if (department.name.length < 3) {
      res.status(400).json({
        success: false,
        error: "Department name must contain at least 3 characters.",
      });
      return;
    }
  }
  department.departmentId = generateId();
  department.managerId = req.manager.managerId;

  let sqlQuery = "SELECT * FROM department WHERE departmentName = ?";
  db.query(sqlQuery, [department.name], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    }
    let values = [
      department.departmentId,
      department.name,
      department.managerId,
    ];
    if (result.length == 0) {
      sqlQuery =
        "INSERT INTO department (departmentId, departmentName, managerId) VALUES ?";
      db.query(sqlQuery, [[values]], (error, result) => {
        if (error) {
          res.status(502).json({
            success: false,
            error: "Internal Server Error.",
          });
          return;
        } else {
          res.status(200).json({
            success: true,
            data: "Department created successfully.",
          });
        }
      });
    } else {
      res.status(409).json({
        success: false,
        error: "Department is already present on system with this name.",
      });
    }
  });
};

// Creating new Operator/Resource
module.exports.createNewOperator = async (req, res) => {
  let operator = req.body;
  if (operator && !operator.departmentId) {
    res.status(502).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
    return;
  }
  let sqlQuery = "SELECT * FROM department WHERE departmentId = ?";
  if (operator && operator.departmentId) {
    db.query(sqlQuery, [operator.departmentId], async (error, result) => {
      if (error) {
        res.status(502).json({
          success: false,
          error: "Internal Server Error",
        });
        return;
      }
      if (result.length == 0) {
        res.status(502).json({
          success: false,
          error: "Something went wrong. Please try again.",
        });
        return;
      } else {
        const check = checkUserData(operator);
        if (!check.result) {
          res.status(400).json({
            success: false,
            error: check.errors,
          });
          return;
        }

        operator.operatorId = generateId();
        const newPassword = await hashPassword(operator.password);
        operator.password = newPassword;
        let values = [
          operator.operatorId,
          operator.name,
          operator.email,
          operator.mobile,
          operator.password,
          operator.departmentId,
        ];
        sqlQuery = "SELECT * FROM operator WHERE email = ? OR mobile = ?";
        db.query(
          sqlQuery,
          [operator.email, operator.mobile],
          (error, result) => {
            if (error) {
              res.status(502).json({
                success: false,
                error: "Internal Server Error.",
              });
              return;
            }
            if (result.length == 0) {
              sqlQuery =
                "INSERT INTO operator (operatorId, name, email, mobile, password, departmentId) VALUES ?";
              db.query(sqlQuery, [[values]], (error, result) => {
                if (error) {
                  res.status(502).json({
                    success: false,
                    error: "Internal Server Error.",
                  });
                  return;
                } else {
                  res.status(200).json({
                    success: true,
                    data: "Operator created successfully.",
                  });
                }
              });
            } else {
              res.status(409).json({
                success: false,
                error:
                  "Operator is already present on system with this mobile number or email.",
              });
            }
          }
        );
      }
    });
  }
};

module.exports.assignTask = async (req, res) => {
  let taskId = req.params.id;
  let manager = req.body;
  let sqlQuery = "SELECT * FROM task WHERE taskID = ?";
  db.query(sqlQuery, [taskId], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    }

    if (result.length != 0) {
      sqlQuery =
        "UPDATE task SET operatorId = ? , managerId = ? , managerNote = ? , priority = ? , AssignationStatus = ? , taskStatus = ? WHERE taskID = ?";

      db.query(
        sqlQuery,
        [
          manager.operatorId,
          manager.managerId,
          manager.managerNote,
          manager.priority,
          manager.AssignationStatus,
          manager.taskStatus,
          taskId,
        ],
        (error, result) => {
          if (error) {
            res.status(502).json({
              success: false,
              error: "Internal Server Error.",
            });
            return;
          } else {
            res.status(200).json({
              success: true,
              data: "task accepted and updated successfully.",
            });
          }
        }
      );
    }
  });
};

module.exports.assignedTask = (req, res) => {
  let sqlQuery = "SELECT * FROM task WHERE AssignationStatus = ?";
  let status = "Assigned";
  db.query(sqlQuery, [status], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res.status(200).json({ result });
    }
  });
};

module.exports.notAssignedTask = async (req, res) => {
  let sqlQuery = "SELECT * FROM task WHERE AssignationStatus = ?";
  let status = "Pending";
  db.query(sqlQuery, [status], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res.status(200).json({ result });
    }
  });
};

module.exports.inProgressTask = async (req, res) => {
  let sqlQuery = "SELECT * FROM task WHERE taskStatus = ?";
  let status = "inProgress";
  db.query(sqlQuery, [status], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res.status(200).json({ result });
    }
  });
};

module.exports.completedTask = async (req, res) => {
  let sqlQuery = "SELECT * FROM task WHERE taskStatus = ?";
  let status = "Completed";
  db.query(sqlQuery, [status], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res.status(200).json({ result });
    }
  });
};

// logout Manager
module.exports.logoutManager = async (req, res) => {
  res
    .clearCookie("jwt")
    .status(200)
    .json({ success: true, data: "Logged out successfully." });
};
