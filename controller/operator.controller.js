const { createToken } = require("../utility/createJWToken");
const { checkPassword } = require("../utility/passwordManager");
const db = require("../database/db");
const maxAge = 3 * 24 * 60 * 60;
const path = require("path");
const multer = require("multer");
const { existsSync, unlinkSync } = require("fs");
const sharp = require("sharp");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/operator");
    },
    filename: function (req, file, cb) {
      req.fileName = req.operator.operatorId + path.extname(file.originalname);
      cb(null, req.fileName);
    },
  }),
}).single("profilePic");

module.exports.uploadProfilePic = async (req, res) => {
  upload(req, res, async () => {
    console.log(req.operator.operatorId);
    sharp("./uploads/operator/" + req.fileName)
      .toFormat("jpeg")
      .toFile(
        "./uploads/operator/" + req.operator.operatorId + ".jpeg",
        (err, info) => {
          if (err) {
            res.status(502).json({
              success: false,
              error: err,
            });
          } else {
            unlinkSync("./uploads/operator/" + req.fileName);
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
  if (existsSync("./uploads/operator/" + req.operator.operatorId + ".jpeg")) {
    res.download("./uploads/operator/" + req.operator.operatorId + ".jpeg");
  } else {
    res.status(404).json({
      success: false,
      error: "No profile pic found",
    });
  }
};

// projects
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

module.exports.loginOperator = async (req, res) => {
  let { email, password } = req.body;
  let sqlQuery = "SELECT * FROM operator WHERE email = ? AND active = 'Active'";
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
        error: "Operator is not registered.",
      });
    } else {
      let id = result[0].operatorId;
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
module.exports.getOperatorProfile = async (req, res) => {
  const operator = req.operator;
  let sqlQuery = "SELECT * FROM department WHERE departmentId = ?";
  db.query(sqlQuery, [operator.departmentId], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal server error.",
      });
      return;
    }
    operator.departmentName = result[0].departmentName;
    delete operator.operatorId;
    delete operator.departmentId;
    delete operator.password;
    res.status(200).json({ success: true, data: { operator } });
  });
};

// get Attachments of a task by taskId
module.exports.getAttachmentsByTaskId = async (req, res) => {
  let taskId = req.params.taskId;
  let operatorId = req.operator.operatorId;
  let sqlQuery =
    "SELECT a.* FROM attachments a NATURAL JOIN task t WHERE a.taskId = ? AND t.taskId = ? AND t.operatorId = ?";
  db.query(sqlQuery, [taskId, taskId, operatorId], (error, result) => {
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

module.exports.changeTaskStatus = async (req, res) => {
  let status = "Completed";
  let taskId = req.params.id;

  let sqlQuery = "UPDATE task SET taskStatus = ? WHERE taskID = ?";

  db.query(sqlQuery, [status, taskId], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      sqlQuery =
        "UPDATE taskTimeline SET completionDate = CURRENT_DATE WHERE taskId = ?";
      db.query(sqlQuery, [taskId], (error, result) => {
        if (error) {
          console.log(error);
          res.status(502).json({
            success: false,
            error: "Internal Server Error",
          });
          return;
        } else {
          res.status(200).json({
            success: true,
            data: "status updated successfully.",
          });
          return;
        }
      });
    }
  });
};

module.exports.acceptTask = async (req, res) => {
  let status = "inProgress";
  let taskId = req.params.id;
  let { operatorNote } = req.body;
  let sqlQuery = "UPDATE task SET taskStatus = ? WHERE taskID = ?";

  db.query(sqlQuery, [status, taskId], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      sqlQuery =
        "Update operatorStatus SET acceptStatus = ?, operatorNote = ? WHERE taskId = ?";
      let queryInputs = ["Accepted", operatorNote, taskId];
      db.query(sqlQuery, queryInputs, (error, result) => {
        if (error) {
          res.status(500).json({
            success: false,
            error: error,
          });
          return;
        } else {
          sqlQuery =
            "UPDATE taskTimeline SET operatorAcceptDate = CURRENT_DATE WHERE taskId = ?";
          db.query(sqlQuery, [taskId], (error, result) => {
            if (error) {
              console.log(error);
              res.status(502).json({
                success: false,
                error: "Internal Server Error",
              });
              return;
            } else {
              res.status(200).json({
                success: true,
                data: "status updated successfully.",
              });
              return;
            }
          });
        }
      });
    }
  });
};

module.exports.taskByOperatorId = async (req, res) => {
  let operatorId = req.operator.operatorId;
  sqlQuery =
    "SELECT * FROM task NATURAL JOIN project ORDER BY closeDate DESC, openDate DESC WHERE operatorId = ?";
  db.query(sqlQuery, [operatorId], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: true,
        error: "Internal Server Error",
      });
      return;
    } else {
      res
        .status(200)
        .json({ success: true, data: "Data Successfully Fetched", result });
    }
  });
};

// logout Operator
module.exports.logoutOperator = async (req, res) => {
  res
    .clearCookie("jwt")
    .status(200)
    .json({ success: true, data: "Logged out successfully." });
};

// get manager by manager Id
module.exports.getManagerByManagerId = async (req, res) => {
  let managerId = req.params.managerId;
  let sqlQuery = "SELECT * FROM manager where managerId = ?";
  db.query(sqlQuery, [managerId], (error, result) => {
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
        error: "No manager Found",
      });
    } else {
      res.status(200).json({
        success: true,
        manager: result[0],
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
