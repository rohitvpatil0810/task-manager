const db = require("../database/db");
const { createToken } = require("../utility/createJWToken");
const { generateId } = require("../utility/idGenerator");
const { checkPassword } = require("../utility/passwordManager");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { existsSync, unlinkSync } = require("fs");
const maxAge = 3 * 24 * 60 * 60;

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/client");
    },
    filename: function (req, file, cb) {
      console.log(file.originalname);
      req.fileName = req.client.cliendId + path.extname(file.originalname);
      cb(null, req.fileName);
    },
  }),
}).single("profilePic");

module.exports.uploadProfilePic = async (req, res) => {
  upload(req, res, async () => {
    sharp("./uploads/client/" + req.fileName)
      .toFormat("jpeg")
      .toFile(
        "./uploads/client/" + req.client.clientId + ".jpeg",
        (err, info) => {
          if (err) {
            unlinkSync("./uploads/client/" + req.fileName);
            res.status(502).json({
              success: false,
              error: err,
            });
          } else {
            unlinkSync("./uploads/client/" + req.fileName);
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
  if (existsSync("./uploads/client/" + req.client.clientId + ".jpeg")) {
    res.download("./uploads/client/" + req.client.clientId + ".jpeg");
  } else {
    res.status(404).json({
      success: false,
      error: "No profile pic found",
    });
  }
};

// client login
module.exports.loginClient = async (req, res) => {
  let { email, password } = req.body;
  let sqlQuery = "SELECT * FROM client WHERE email = ? AND active = 'Active'";
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
        error: "Client is not registered.",
      });
    } else {
      let id = result[0].clientId;
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

// get profile of client
module.exports.getClientProfile = async (req, res) => {
  const client = req.client;
  delete client.clientId;
  delete client.password;
  res.status(200).json({ success: true, data: { client } });
};

// client logout
module.exports.logoutClient = async (req, res) => {
  res
    .clearCookie("jwt")
    .status(200)
    .json({ success: true, data: "Logged out successfully." });
};

module.exports.createTask = async (req, res) => {
  let task = req.body;
  let clientId = req.client.clientId;
  task.taskID = generateId();
  task.taskCategory = "Scheduled";
  let values = [
    task.taskID,
    clientId,
    task.ProjectName,
    task.taskName,
    task.taskDescription,
    task.openDate,
    task.closeDate,
    task.clientNote,
    task.taskCategory,
  ];

  let sqlQuery =
    "INSERT INTO task (taskID , clientId , ProjectName , taskName , taskDescription , openDate , closeDate , clientNote , taskCategory) VALUES ?";

  db.query(sqlQuery, [[values]], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    } else {
      let taskTimelineId = generateId();
      values = [taskTimelineId, task.taskID, task.openDate, task.closeDate];
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

// get Attachments of a task by taskId
module.exports.getAttachmentsByTaskId = async (req, res) => {
  let taskId = req.params.taskId;
  let clientId = req.client.clientId;
  let sqlQuery =
    "SELECT a.* FROM attachments a NATURAL JOIN task t WHERE a.taskId = ? AND t.taskId = ? AND t.clientId = ?";
  db.query(sqlQuery, [taskId, taskId, clientId], (error, result) => {
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

// attach documents links to a task by task Id
module.exports.attachDocumentsByTaskId = async (req, res) => {
  let taskId = req.params.taskId;
  let clientId = req.client.clientId;
  let { documentsList } = req.body;
  let sqlQuery = "SELECT * FROM task WHERE taskId = ? AND clientId = ?";
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

module.exports.trackYourTask = async (req, res) => {
  let id = req.client.clientId;
  let sqlQuery = "SELECT * FROM task WHERE clientId = ?";

  db.query(sqlQuery, [id], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error",
      });
      return;
    } else {
      res.status(200).json({
        success: true,
        data: "Data Fetched Successfully",
        result,
      });
    }
  });
};

module.exports.clientApproval = async (req, res) => {
  let id = req.params.id;
  let noteByClient = req.body.Note;

  let sqlQuery = "SELECT * FROM task WHERE taskID = ? AND managerApproval = ?";
  db.query(sqlQuery, [id, "Accepted"], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error",
      });
      return;
    } else {
      if (result.length != 0) {
        sqlQuery =
          "UPDATE task SET clientApproval = ? , clientNote = ? , taskStatus = ? WHERE taskID = ? AND managerApproval = ? ";
        db.query(
          sqlQuery,
          ["Accepted", noteByClient, "Closed", id, "Accepted"],
          async (error, result) => {
            if (error) {
              res.status(502).json({
                success: false,
                error: "Internal Server Error",
              });
              return;
            } else {
              sqlQuery =
                "UPDATE taskTimeline SET clientApprovalDate = CURRENT_DATE, actualCloseDate = CURRENT_DATE WHERE taskId = ?";
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
                    data: "Task Approved and Closed Successfully",
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
          error: "Internal Server Error",
        });
        return;
      }
    }
  });
};

// Reject task by client
module.exports.rejectTaskByClient = async (req, res) => {
  let id = req.params.id;
  let noteByClient = req.body.Note;

  let sqlQuery = "SELECT * FROM task WHERE taskID = ? AND managerApproval = ?";
  db.query(sqlQuery, [id, "Accepted"], async (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error",
      });
      return;
    } else {
      if (result.length != 0) {
        sqlQuery =
          "UPDATE task SET clientApproval = ? , clientNote = ? , taskStatus = ?, managerApproval = ? WHERE taskID = ? AND managerApproval = ? ";
        db.query(
          sqlQuery,
          ["Rejected", noteByClient, "inProgress", "Pending", id, "Accepted"],
          async (error, result) => {
            if (error) {
              res.status(502).json({
                success: false,
                error: "Internal Server Error",
              });
              return;
            } else {
              sqlQuery =
                "UPDATE taskTimeline SET clientRejection = CURRENT_DATE, lastReassignation = CURRENT_DATE WHERE taskId = ?";
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
                    data: "Task rejected by client.",
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
          error: "Internal Server Error",
        });
        return;
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
