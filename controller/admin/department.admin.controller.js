const db = require("../../database/db");
const { unlinkSync, existsSync } = require("fs");
const sharp = require("sharp");
const { uploadToDepartment } = require("../../middleware/multer.middleware");
const { generateId } = require("../../utility/idGenerator");

module.exports.addDepartment = async (req, res) => {
  uploadToDepartment(req, res, async () => {
    const departmentName = req.body.departmentName;
    const departmentId = generateId();
    let sqlQuery = "SELECT * FROM department WHERE departmentName = ?";
    db.query(sqlQuery, [departmentName], (err, result) => {
      if (err) {
        if (existsSync("./uploads/department/" + req.fileName)) {
          unlinkSync("./uploads/department/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          error: toString(err),
        });
        return;
      }
      if (result.length == 0) {
        if (departmentName.length >= 3) {
          if (existsSync("./uploads/department/" + req.fileName)) {
            unlinkSync("./uploads/department/" + req.fileName);
            sharp("./uploads/department/" + req.fileName)
              .toFormat("jpeg")
              .toFile(
                "./uploads/department/" + departmentId + ".jpeg",
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
                    unlinkSync("./uploads/department/" + req.fileName);
                    sqlQuery =
                      "INSERT INTO department (departmentId, departmentName) VALUES ?";
                    db.query(
                      sqlQuery,
                      [[[departmentId, departmentName]]],
                      (err, result) => {
                        if (err) {
                          console.log(2, err);
                          unlinkSync(
                            "./uploads/department/" + departmentId + ".jpeg"
                          );
                          res.status(502).json({
                            success: false,
                            error: toString(err),
                          });
                          return;
                        }
                        res.status(200).json({
                          success: true,
                          data: "Department Added Successfully.",
                        });
                      }
                    );
                  }
                }
              );
          } else {
            res.status(200).json({
              success: true,
              data: "Department Added Successfully.",
            });
          }
        } else {
          if (existsSync("./uploads/department/" + req.fileName)) {
            unlinkSync("./uploads/department/" + req.fileName);
          }
          res.status(400).json({
            success: false,
            error: "department Name should be atleast 3 characters long.",
          });
        }
      } else {
        if (existsSync("./uploads/department/" + req.fileName)) {
          unlinkSync("./uploads/department/" + req.fileName);
        }
        res.status(403).json({
          success: false,
          error: "department Already Exists in system with same name.",
        });
      }
    });
  });
};

module.exports.editDepartment = async (req, res) => {
  uploadToDepartment(req, res, async () => {
    const departmentId = req.params.departmentId;
    const departmentName = req.body.departmentName;
    let sqlQuery = "SELECT * FROM department WHERE departmentName = ?";
    db.query(sqlQuery, [departmentName], (err, result) => {
      if (err) {
        if (existsSync("./uploads/department/" + req.fileName)) {
          unlinkSync("./uploads/department/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          error: toString(err),
        });
        return;
      } else if (result.length == 0) {
        sqlQuery = "SELECT * FROM department WHERE departmentId = ?";
        db.query(sqlQuery, [departmentId], (err, result) => {
          if (err) {
            if (existsSync("./uploads/department/" + req.fileName)) {
              unlinkSync("./uploads/department/" + req.fileName);
            }
            res.status(502).json({
              success: false,
              error: toString(err),
            });
            return;
          }
          if (result.length == 1) {
            if (departmentName.length < 3) {
              if (existsSync("./uploads/department/" + req.fileName)) {
                unlinkSync("./uploads/department/" + req.fileName);
              }
              res.status(400).json({
                success: false,
                error: "Department Name Cannot be less than 3 characters",
              });
              return;
            }
            if (existsSync("./uploads/department/" + req.fileName)) {
              sharp("./uploads/department/" + req.fileName)
                .toFormat("jpeg")
                .toFile(
                  "./uploads/department/" + departmentId + ".jpeg",
                  (err, info) => {
                    if (err) {
                      unlinkSync("./uploads/department/" + req.fileName);
                      console.log(1, err);
                      res.status(502).json({
                        success: false,
                        error: toString(err),
                      });
                      return;
                    } else {
                      unlinkSync("./uploads/department/" + req.fileName);
                      sqlQuery =
                        "UPDATE department SET departmentName = ? WHERE departmentId = ?";
                      db.query(
                        sqlQuery,
                        [departmentName, departmentId],
                        (err, result) => {
                          if (err) {
                            console.log(2, err);
                            unlinkSync(
                              "./uploads/department/" + departmentId + ".jpeg"
                            );
                            res.status(502).json({
                              success: false,
                              error: toString(err),
                            });
                            return;
                          }
                          res.status(200).json({
                            success: true,
                            data: "department Edited Successfully.",
                          });
                        }
                      );
                    }
                  }
                );
            } else {
              res.status(200).json({
                success: true,
                data: "department Edited Successfully.",
              });
            }
          } else {
            if (existsSync("./uploads/department/" + req.fileName)) {
              unlinkSync("./uploads/department/" + req.fileName);
            }
            res.status(404).json({
              success: false,
              error: "Department does not exists",
            });
            return;
          }
        });
      } else {
        if (existsSync("./uploads/department/" + req.fileName)) {
          unlinkSync("./uploads/department/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          data: "Department Already exists",
        });
        return;
      }
    });
  });
};

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
