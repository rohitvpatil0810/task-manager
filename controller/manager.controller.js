const { createToken } = require("../utility/createJWToken");
const { checkPassword, hashPassword } = require("../utility/passwordManager");
const db = require("../database/db");
const { generateId } = require("../utility/idGenerator");
const { checkUserData } = require("../utility/checkUserData");
const maxAge = 3 * 24 * 60 * 60;
const path = require("path");
const multer = require("multer");
const { existsSync, unlinkSync } = require("fs");
const sharp = require("sharp");
const { sendEmail } = require("../utility/sendEmail");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/manager");
    },
    filename: function (req, file, cb) {
      req.fileName = req.manager.managerId + path.extname(file.originalname);
      cb(null, req.fileName);
    },
  }),
}).single("profilePic");

module.exports.uploadProfilePic = async (req, res) => {
  upload(req, res, async () => {
    sharp("./uploads/manager/" + req.fileName)
      .toFormat("jpeg")
      .toFile(
        "./uploads/manager/" + req.manager.managerId + ".jpeg",
        (err, info) => {
          if (err) {
            res.status(502).json({
              success: false,
              error: err,
            });
          } else {
            unlinkSync("./uploads/manager/" + req.fileName);
            res.status(200).json({
              success: true,
              data: "Profile Pic Uploaded Successfully.",
            });
          }
        }
      );
  });
};

module.exports.getProfilePic = async (req, res) => {
  if (existsSync("./uploads/manager/" + req.manager.managerId + ".jpeg")) {
    res.download("./uploads/manager/" + req.manager.managerId + ".jpeg");
  } else {
    res.status(404).json({
      success: false,
      error: "No profile pic found",
    });
  }
};

// projects
module.exports.getProjects = async (req, res) => {
  let sqlQuery = "SELECT * FROM project where active = 'Active'";
  db.query(sqlQuery, async (err, result) => {
    if (err) {
      res.status(502).json({
        success: false,
        error: "Internal Server error",
        log: err,
      });
    } else {
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  });
};

module.exports.getProjectbyProjectId = async (req, res) => {
  let projectId = req.params.projectId;
  let sqlQuery = "SELECT * FROM project where projectId = ?";
  db.query(sqlQuery, [projectId], async (err, result) => {
    if (err) {
      res.status(502).json({
        success: false,
        error: "Internal Server error",
        log: err,
      });
    }
    if (result.length == 1) {
      res.status(200).json({
        success: true,
        data: result[0],
      });
    }
  });
};

module.exports.getProjectIcon = async (req, res) => {
  let projectId = req.params.projectId;
  if (existsSync("./uploads/project/" + projectId + ".jpeg")) {
    res.download("./uploads/project/" + projectId + ".jpeg");
  } else {
    res.status(404).json({
      success: false,
      error: "No project icon found",
    });
  }
};

// login Manager
module.exports.loginManager = async (req, res) => {
  let { email, password } = req.body;
  let sqlQuery = "SELECT * FROM manager WHERE email = ? AND active = 'Active'";
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
        let originalPassword = operator.password;
        const newPassword = await hashPassword(operator.password);
        operator.password = newPassword;
        let values = [
          operator.operatorId,
          operator.name,
          operator.email,
          operator.mobile,
          operator.password,
          operator.departmentId,
          "Active",
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
                "INSERT INTO operator (operatorId, name, email, mobile, password, departmentId, active) VALUES ?";
              db.query(sqlQuery, [[values]], (error, result) => {
                if (error) {
                  res.status(502).json({
                    success: false,
                    error: "Internal Server Error.",
                  });
                  return;
                } else {
                  let sendOptions = {
                    name: operator.name,
                    email: operator.email,
                    password: originalPassword,
                    role: "Operator",
                  };
                  sendEmail(sendOptions);
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

// delete an operator
module.exports.deleteOperator = async (req, res) => {
  let operatorId = req.params.operatorId;
  if (operatorId) {
    let sqlQuery = "SELECT * FROM operator where operatorId = ?";
    db.query(sqlQuery, [operatorId], (err, result) => {
      if (err) {
        res.status(502).json({
          success: false,
          error: "Internal Server Error.",
        });
      }
      if (result.length == 1) {
        sqlQuery =
          "UPDATE operator SET active = 'Deleted' where operatorId = ?";
        db.query(sqlQuery, [operatorId], (err, result) => {
          if (err) {
            res
              .status(502)
              .json({ success: false, error: "Internal Server Error." });
          }
          res.status(200).json({
            success: true,
            data: "Operator Deleted Successfully.",
          });
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: "No Operator Found.",
    });
  }
};

// Fetch list of available departments
module.exports.getDepartments = async (req, res) => {
  let sqlQuery = "SELECT * FROM department";
  db.query(sqlQuery, (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        erro: "Internal Server Error.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: { departments: result },
    });
  });
};

module.exports.getClients = async (req, res) => {
  let sqlQuery = "SELECT * FROM client";
  db.query(sqlQuery, "", async (err, result) => {
    if (err) {
      res.status(502).json({
        success: false,
        error: "Internal Server error",
        log: err,
      });
    } else {
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  });
};

module.exports.createTask = async (req, res) => {
  let task = req.body;
  task.taskID = generateId();
  task.taskCategory = "Scheduled";
  let values = [
    task.taskID,
    task.clientId,
    task.projectId,
    task.taskName,
    task.taskDescription,
    task.openDate,
    task.closeDate,
    task.clientNote,
    task.taskCategory,
  ];

  let sqlQuery =
    "SELECT * FROM project where projectId = ? AND active = 'Active'";
  db.query(sqlQuery, [task.projectId], (err, result) => {
    if (err) {
      res.status(502).json({
        success: false,
        error: toString(err),
      });
      return;
    }
    if (result.length == 1) {
      sqlQuery =
        "SELECT * FROM client where clientId = ? AND active = 'Active'";
      db.query(sqlQuery, [task.clientId], (err, result) => {
        if (err) {
          res.status(502).json({
            success: false,
            error: toString(err),
          });
          return;
        }
        if (result.length == 1) {
          sqlQuery =
            "INSERT INTO task (taskID , clientId , projectId , taskName , taskDescription , openDate , closeDate , clientNote , taskCategory) VALUES ?";

          db.query(sqlQuery, [[values]], (error, result) => {
            if (error) {
              res.status(502).json({
                success: false,
                error: "Internal Server Error.",
              });
              return;
            } else {
              let taskTimelineId = generateId();
              values = [
                taskTimelineId,
                task.taskID,
                task.openDate,
                task.closeDate,
              ];
              sqlQuery =
                "INSERT INTO taskTimeline (timelineId, taskId, openDate, closeDate) VALUES ?";
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
                    data: "Task created successfully.",
                  });
                }
              });
            }
          });
        } else {
          res.status(404).json({
            success: false,
            error:
              "Please Refresh the client List as client seems to be deleted.",
          });
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error:
          "Please Refresh the project List as Project seems to be deleted.",
      });
    }
  });
};
// Fetch list of operators for a department
module.exports.getOperatorsByDepartment = async (req, res) => {
  let departmentId = req.params.departmentId;
  console.log(departmentId);
  sqlQuery =
    "SELECT * FROM operator WHERE departmentId = ? AND active = 'Active'";
  db.query(sqlQuery, [departmentId], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        data: "Internal Server Error.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: { operators: result },
    });
  });
};

// get Attachments of a task by taskId
module.exports.getAttachmentsByTaskId = async (req, res) => {
  let taskId = req.params.taskId;
  let managerId = req.manager.managerId;
  let sqlQuery =
    "SELECT a.* FROM attachments a NATURAL JOIN task t WHERE a.taskId = ? AND t.taskId = ?";
  db.query(sqlQuery, [taskId, taskId], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        data: "Internal Server Error.",
      });
    } else {
      if (result.length == 0) {
        res.status(404).json({
          success: false,
          error: "No attachments found.",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  });
};

// get taskTimeline for a certain task id
module.exports.getTaskTimelineByTaskId = async (req, res) => {
  let taskId = req.params.taskId;
  let sqlQuery = "SELECT * FROM taskTimeline WHERE taskId = ?";
  db.query(sqlQuery, [taskId], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res.status(200).json({
        success: true,
        data: { timeline: result[0] },
      });
    }
  });
};

// assigning task to a resource
module.exports.assignTask = async (req, res) => {
  let taskId = req.params.id;
  let manager = req.body;
  let managerId = req.manager.managerId;

  let sqlQuery = "SELECT * FROM task WHERE taskID = ?";
  db.query(sqlQuery, [taskId], async (error, result) => {
    if (error) {
      console.log(error);
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    }

    if (result.length != 0) {
      sqlQuery =
        "SELECT * FROM operator Where operatorId = ? AND active = 'Active'";
      db.query(sqlQuery, [manager.operatorId], (err, result) => {
        if (err) {
          res.status(502).json({
            success: false,
            error: "Internal Server Error.",
          });
        }
        if (result.length == 1) {
          sqlQuery =
            "UPDATE task SET operatorId = ? , managerId = ? , managerNote = ? , priority = ? , AssignationStatus = ? , taskStatus = ? WHERE taskID = ?";

          db.query(
            sqlQuery,
            [
              manager.operatorId,
              managerId,
              manager.managerNote,
              manager.priority,
              manager.AssignationStatus,
              "Pending",
              taskId,
            ],
            (error, result) => {
              if (error) {
                console.log(error);
                res.status(502).json({
                  success: false,
                  error: "Internal Server Error.",
                });
                return;
              } else {
                sqlQuery =
                  "UPDATE taskTimeline SET assignationDate = CURRENT_DATE WHERE taskId = ?";
                db.query(sqlQuery, [taskId], (error, result) => {
                  if (error) {
                    console.log(error);
                    res.status(502).json({
                      success: false,
                      error: "Internal Server Error",
                    });
                    return;
                  } else {
                    sqlQuery =
                      "INSERT INTO operatorStatus (statusId, operatorId, taskId) VALUES ?";
                    let operatorStatusValues = [
                      generateId(),
                      manager.operatorId,
                      taskId,
                    ];
                    db.query(
                      sqlQuery,
                      [[operatorStatusValues]],
                      (error, result) => {
                        if (error) {
                          res.status(500).json({
                            success: false,
                            error: error,
                          });
                        } else {
                          res.status(200).json({
                            success: true,
                            data: "Task assigned and updated successfully.",
                          });
                        }
                      }
                    );

                    return;
                  }
                });
              }
            }
          );
        } else {
          res.status(404).json({
            success: false,
            error: "Operator does not exists or Deleted. Please Refresh list.",
          });
        }
      });
    } else {
      res.status(502).json({
        status: false,
        error: "Internal Server Error.",
      });
    }
  });
};

module.exports.assignedTask = (req, res) => {
  let id = req.manager.managerId;
  let sqlQuery =
    "SELECT * FROM task WHERE AssignationStatus = ? AND managerId = ?";
  let status = "Assigned";
  db.query(sqlQuery, [status, id], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res
        .status(200)
        .json({ success: true, data: "Data Successfully Fetched", result });
    }
  });
};

module.exports.getTasks = (req, res) => {
  let id = req.manager.managerId;
  let sqlQuery = "SELECT * FROM task NATURAL JOIN project WHERE managerId = ?";
  db.query(sqlQuery, [id], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res
        .status(200)
        .json({ success: true, data: "Data Successfully Fetched", result });
    }
  });
};

module.exports.notAssignedTask = async (req, res) => {
  let sqlQuery =
    "SELECT * FROM task NATURAL JOIN project WHERE AssignationStatus = ?";
  let status = "Pending";
  db.query(sqlQuery, [status], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res
        .status(200)
        .json({ success: true, data: "Data Successfully Fetched", result });
    }
  });
};

module.exports.inProgressTask = async (req, res) => {
  let id = req.manager.managerId;
  let sqlQuery =
    "SELECT * FROM task NATURAL JOIN project WHERE taskStatus = ? AND managerId = ?";
  let status = "inProgress";
  db.query(sqlQuery, [status, id], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res
        .status(200)
        .json({ success: true, data: "Data Successfully Fetched", result });
    }
  });
};

module.exports.completedTask = async (req, res) => {
  let id = req.manager.managerId;
  let sqlQuery =
    "SELECT * FROM task NATURAL JOIN project WHERE taskStatus = ? AND managerId = ?";
  let status = "Completed";
  db.query(sqlQuery, [status, id], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      res
        .status(200)
        .json({ success: true, data: "Data Successfully Fetched", result });
    }
  });
};

module.exports.approveTask = async (req, res) => {
  let id = req.params.id;
  let noteByManager = req.body.Note;
  let sqlQuery = "SELECT * FROM task WHERE taskID = ? AND taskStatus = ?";

  db.query(sqlQuery, [id, "Completed"], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error",
      });
      return;
    } else {
      if (result.length != 0) {
        sqlQuery =
          "UPDATE task SET managerApproval = ? , managerNote = ? WHERE taskID = ? AND taskStatus = ?";
        db.query(
          sqlQuery,
          ["Accepted", noteByManager, id, "Completed"],
          async (error, result) => {
            if (error) {
              res.status(502).json({
                success: true,
                error: "Internal Server Error",
              });
              return;
            } else {
              sqlQuery =
                "UPDATE taskTimeline SET managerApprovalDate = CURRENT_DATE WHERE taskId = ?";
              db.query(sqlQuery, [id], (error, result) => {
                if (error) {
                  res.status(502).json({
                    success: false,
                    error: "Internal Server Error",
                  });
                  return;
                } else {
                  res.status(200).json({
                    success: true,
                    data: "Task Approved Successfully",
                  });
                  return;
                }
              });
            }
          }
        );
      } else {
        res.status(502).json({
          success: false,
          error: "Current Task is not completed by operator.",
        });
        return;
      }
    }
  });
};

// Reject a task
module.exports.rejectTask = async (req, res) => {
  let id = req.params.taskId;
  let noteByManager = req.body.Note;
  let sqlQuery = "SELECT * FROM task WHERE taskID = ? AND taskStatus = ?";

  db.query(sqlQuery, [id, "Completed"], async (error, result) => {
    if (error) {
      console.log(error);
      res.status(502).json({
        success: false,
        error: "Internal Server Error",
      });
      return;
    } else {
      if (result.length != 0) {
        sqlQuery =
          "UPDATE task SET managerApproval = ? , managerNote = ?, taskStatus = ? WHERE taskID = ? AND taskStatus = ?";
        db.query(
          sqlQuery,
          ["Rejected", noteByManager, "inProgress", id, "Completed"],
          async (error, result) => {
            if (error) {
              console.log(error);
              res.status(502).json({
                success: true,
                error: "Internal Server Error",
              });
              return;
            } else {
              sqlQuery =
                "UPDATE taskTimeline SET managerRejectionDate = CURRENT_DATE, lastReassignation = CURRENT_DATE WHERE taskId = ?";
              db.query(sqlQuery, [id], (error, result) => {
                if (error) {
                  res.status(502).json({
                    success: false,
                    error: "Internal Server Error",
                  });
                  return;
                } else {
                  res.status(200).json({
                    success: true,
                    data: "Task rejected.",
                  });
                  return;
                }
              });
            }
          }
        );
      } else {
        res.status(502).json({
          success: false,
          error: "Current Task is not completed by operator.",
        });
        return;
      }
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

module.exports.attachDocumentsByTaskId = async (req, res) => {
  let taskId = req.params.taskId;
  let { documentsList } = req.body;
  let sqlQuery = "SELECT * FROM task WHERE taskId = ?";
  db.query(sqlQuery, [taskId, clientId], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      if (result.length == 0) {
        res.status(502).json({
          success: false,
          error: "Something went wrong. Please try again.",
        });
        return;
      } else {
        let values = [];
        documentsList.forEach((document) => {
          document.attachmentId = generateId();
          document.taskId = taskId;
          values.push(Object.values(document));
        });
        sqlQuery =
          "INSERT INTO attachments (documentName, driveLink, attachmentId, taskId) VALUES ?";
        db.query(sqlQuery, [values], (error, result) => {
          if (error) {
            res.status(502).json({
              success: false,
              error: "Internal Server Error.",
            });
            return;
          } else {
            res.status(200).json({
              success: true,
              data: "Attachments attached Successfully.",
            });
          }
        });
      }
    }
  });
};

// get operator by opertor Id
module.exports.getOperatorByOperatorId = async (req, res) => {
  let operatorId = req.params.operatorId;
  let sqlQuery = "SELECT * FROM operator where operatorId = ?";
  db.query(sqlQuery, [operatorId], (error, result) => {
    if (error) {
      console.log(error);
      res.send(502).json({
        success: true,
        error: "Internal Server Error.",
      });
    }
    if (result.length == 0) {
      res.status(404).json({
        success: false,
        error: "No operator Found",
      });
    } else {
      res.status(200).json({
        success: true,
        operator: result[0],
      });
    }
  });
};

// get client by client Id
module.exports.getClientByClientId = async (req, res) => {
  let clientId = req.params.clientId;
  let sqlQuery = "SELECT * FROM client where clientId = ?";
  db.query(sqlQuery, [clientId], (error, result) => {
    if (error) {
      console.log(error);
      res.send(502).json({
        success: true,
        error: "Internal Server Error.",
      });
    }
    if (result.length == 0) {
      res.status(404).json({
        success: false,
        error: "No client Found",
      });
    } else {
      res.status(200).json({
        success: true,
        client: result[0],
      });
    }
  });
};
