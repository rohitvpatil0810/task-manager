const db = require("../../database/db");
const { unlinkSync, existsSync } = require("fs");
const sharp = require("sharp");
const { uploadToProject } = require("../../middleware/multer.middleware");
const { generateId } = require("../../utility/idGenerator");

module.exports.createNewProject = async (req, res) => {
  uploadToProject(req, res, async () => {
    const projectName = req.body.projectName;
    const projectId = generateId();
    let sqlQuery = "SELECT * FROM project WHERE projectName = ?";
    db.query(sqlQuery, [projectName], (err, result) => {
      if (err) {
        unlinkSync("./uploads/project/" + req.fileName);
        res.status(502).json({
          success: false,
          error: toString(err),
        });
        return;
      }
      if (result.length == 0) {
        if (projectName.length >= 3) {
          sharp("./uploads/project/" + req.fileName)
            .toFormat("jpeg")
            .toFile("./uploads/project/" + projectId + ".jpeg", (err, info) => {
              if (err) {
                unlinkSync("./uploads/project/" + req.fileName);
                console.log(1, err);
                res.status(502).json({
                  success: false,
                  error: toString(err),
                });
                return;
              } else {
                unlinkSync("./uploads/project/" + req.fileName);
                sqlQuery =
                  "INSERT INTO project (projectId, projectName) VALUES ?";
                db.query(
                  sqlQuery,
                  [[[projectId, projectName]]],
                  (err, result) => {
                    if (err) {
                      console.log(2, err);
                      unlinkSync("./uploads/project/" + projectId + ".jpeg");
                      res.status(502).json({
                        success: false,
                        error: toString(err),
                      });
                      return;
                    }
                    res.status(200).json({
                      success: true,
                      data: "Project Added Successfully.",
                    });
                  }
                );
              }
            });
        } else {
          unlinkSync("./uploads/project/" + req.fileName);
          res.status(400).json({
            success: false,
            error: "Project Name should be atleast 3 characters long.",
          });
        }
      } else {
        unlinkSync("./uploads/project/" + req.fileName);
        res.status(403).json({
          success: false,
          error: "Project Already Exists in system with same name.",
        });
      }
    });
  });
};

module.exports.activateProject = async (req, res) => {
  let projectId = req.params.projectId;
  if (projectId) {
    let sqlQuery = "SELECT * FROM project where projectId = ?";
    db.query(sqlQuery, [projectId], (err, result) => {
      if (err) {
        res.status(502).json({
          success: false,
          error: toString(err),
        });
      }
      if (result.length == 1) {
        sqlQuery = "UPDATE project SET active = 'Active' where projectId = ?";
        db.query(sqlQuery, [projectId], (err, result) => {
          if (err) {
            res.status(502).json({ success: false, error: toString(err) });
          }
          res.status(200).json({
            success: true,
            data: "Project Activated Successfully.",
          });
        });
      } else {
        res.status(404).json({
          success: false,
          error: "No Project Found.",
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: "No Project Found.",
    });
  }
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

module.exports.getProjects = async (req, res) => {
  let sqlQuery = "SELECT * FROM project where active = 'Active'";
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

module.exports.getDeactivatedProjects = async (req, res) => {
  let sqlQuery = "SELECT * FROM project where active = 'Deleted'";
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

module.exports.deleteProject = async (req, res) => {
  let projectId = req.params.projectId;
  if (projectId) {
    let sqlQuery = "SELECT * FROM project where projectId = ?";
    db.query(sqlQuery, [projectId], (err, result) => {
      if (err) {
        res.status(502).json({
          success: false,
          error: toString(err),
        });
      }
      if (result.length == 1) {
        sqlQuery = "UPDATE project SET active = 'Deleted' where projectId = ?";
        db.query(sqlQuery, [projectId], (err, result) => {
          if (err) {
            res.status(502).json({ success: false, error: toString(err) });
          }
          res.status(200).json({
            success: true,
            data: "Project Deleted Successfully.",
          });
        });
      } else {
        res.status(404).json({
          success: false,
          error: "No Project Found.",
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: "No Project Found.",
    });
  }
};

module.exports.editProject = async (req, res) => {
  upload(req, res, async () => {
    const projectId = req.params.projectId;
    const projectName = req.body.projectName;
    let sqlQuery = "SELECT * FROM project WHERE projectName = ?";
    db.query(sqlQuery, [projectName], (err, result) => {
      if (err) {
        if (existsSync("./uploads/project/" + req.fileName)) {
          unlinkSync("./uploads/project/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          error: toString(err),
        });
        return;
      } else if (result.length == 0) {
        sqlQuery = "SELECT * FROM project WHERE projectId = ?";
        if (projectName.length)
          db.query(sqlQuery, [projectId], (err, result) => {
            if (err) {
              if (existsSync("./uploads/project/" + req.fileName)) {
                unlinkSync("./uploads/project/" + req.fileName);
              }
              res.status(502).json({
                success: false,
                error: toString(err),
              });
              return;
            }
            if (result.length == 1) {
              if (projectName.length < 3) {
                if (existsSync("./uploads/project/" + req.fileName)) {
                  unlinkSync("./uploads/project/" + req.fileName);
                }
                res.status(502).json({
                  success: false,
                  error: "Project Name should be atleast 3 characters long.",
                });
                return;
              }
              if (existsSync("./uploads/project/" + req.fileName)) {
                sharp("./uploads/project/" + req.fileName)
                  .toFormat("jpeg")
                  .toFile(
                    "./uploads/project/" + projectId + ".jpeg",
                    (err, info) => {
                      if (err) {
                        unlinkSync("./uploads/project/" + req.fileName);
                        console.log(1, err);
                        res.status(502).json({
                          success: false,
                          error: toString(err),
                        });
                        return;
                      } else {
                        unlinkSync("./uploads/project/" + req.fileName);
                        sqlQuery =
                          "UPDATE project SET projectName = ? WHERE projectId = ?";
                        db.query(
                          sqlQuery,
                          [projectName, projectId],
                          (err, result) => {
                            if (err) {
                              console.log(2, err);
                              res.status(502).json({
                                success: false,
                                error: toString(err),
                              });
                              return;
                            }
                            res.status(200).json({
                              success: true,
                              data: "Project Edited Successfully.",
                            });
                          }
                        );
                      }
                    }
                  );
              } else {
                res.status(200).json({
                  success: true,
                  data: "Project Edited Successfully.",
                });
              }
            } else {
              if (existsSync("./uploads/project/" + req.fileName)) {
                unlinkSync("./uploads/project/" + req.fileName);
              }
              res.status(502).json({
                success: false,
                error: "Project doesnot exists",
              });
            }
          });
      } else {
        if (existsSync("./uploads/project/" + req.fileName)) {
          unlinkSync("./uploads/project/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          eroor: "Project Name already exists",
        });
      }
    });
  });
};
