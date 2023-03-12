const db = require("../../database/db");
const { checkUserData } = require("../../utility/checkUserData");
const { createToken } = require("../../utility/createJWToken");
const { generateId } = require("../../utility/idGenerator");
const {
  hashPassword,
  checkPassword,
} = require("../../utility/passwordManager");
const maxAge = 3 * 24 * 60 * 60;
const { existsSync, unlinkSync } = require("fs");
const { sendEmail } = require("../../utility/sendEmail");
const path = require("path");
const sharp = require("sharp");

module.exports.editOperator = async (req, res) => {
  uploadToOperator(req, res, async () => {
    const operator = req.body;
    const operatorId = req.params.operatorId;
    let sqlQuery = "SELECT * FROM operator WHERE operatorId = ?";
    db.query(sqlQuery, [operatorId], async (error, result) => {
      if (error) {
        if (existsSync("./uploads/operator/" + req.fileName)) {
          unlinkSync("./uploads/operator/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          error: toString(err),
        });
        return;
      } else if (result.length == 1) {
        let values = [];
        if (operator.password) {
          operator.password = await hashPassword(operator.password);
          sqlQuery =
            "UPDATE operator SET name = ? , email = ? , mobile = ? , password = ? WHERE operatorId = ?";
          values = [
            operator.name,
            operator.email,
            operator.mobile,
            operator.password,
            operatorId,
          ];
        } else {
          sqlQuery =
            "UPDATE operator SET name = ? , email = ? , mobile = ? WHERE operatorId = ?";
          values = [operator.name, operator.email, operator.mobile, operatorId];
        }
        db.query(sqlQuery, values, (err, result) => {
          if (err) {
            if (existsSync("./uploads/operator/" + req.fileName)) {
              unlinkSync("./uploads/operator/" + req.fileName);
            }
            res.status(502).json({
              success: false,
              error: toString(err),
            });
            return;
          }
          if (existsSync("./uploads/operator/" + req.fileName)) {
            sharp("./uploads/operator/" + req.fileName)
              .toFormat("jpeg")
              .toFile(
                "./uploads/operator/" + operatorId + ".jpeg",
                (err, info) => {
                  if (err) {
                    if (existsSync("./uploads/operator/" + req.fileName)) {
                      unlinkSync("./uploads/operator/" + req.fileName);
                    }
                    res.status(502).json({
                      success: false,
                      error: toString(err),
                    });
                    return;
                  } else {
                    if (existsSync("./uploads/operator/" + req.fileName)) {
                      unlinkSync("./uploads/operator/" + req.fileName);
                    }
                    res.status(200).json({
                      success: true,
                      data: "operator Edited Successfully",
                    });
                  }
                }
              );
          } else {
            res.status(200).json({
              success: true,
              data: "operator Edited Successfully",
            });
          }
        });
      }
    });
  });
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

module.exports.getOperatorProfilePic = async (req, res) => {
  let operatorId = req.params.operatorId;
  if (existsSync("./uploads/operator/" + operatorId + ".jpeg")) {
    res.download("./uploads/operator/" + operatorId + ".jpeg");
  } else {
    res.status(404).json({
      success: false,
      error: "No profile pic found",
    });
  }
};

// login Admin
module.exports.loginAdmin = async (req, res) => {
  let { email, password } = req.body;
  let sqlQuery = "SELECT * FROM admin WHERE email = ?";
  let value = [email];
  db.query(sqlQuery, [value], async (error, result) => {
    if (error) {
      console.log(error);
      res.status(502).json({
        success: false,
        message: "Internal Server Error.",
        log: error,
      });
      return;
    }
    if (result.length == 0) {
      res.status(404).json({
        success: false,
        error: "Admin is not registered.",
      });
    } else {
      let id = result[0].id;
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

module.exports.getOperators = async (req, res) => {
  let sqlQuery = "SELECT * FROM operator where active = 'Active'";
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

module.exports.getDeactivatedOperators = async (req, res) => {
  let sqlQuery = "SELECT * FROM operator where active = 'Deleted'";
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

module.exports.createNewOperator = async (req, res) => {
  uploadToOperator(req, res, async () => {
    let operator = req.body;
    if (operator && !operator.departmentId) {
      unlinkSync("./uploads/operator/" + req.fileName);
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
          unlinkSync("./uploads/opertaor/" + req.fileName);
          res.status(502).json({
            success: false,
            error: "Internal Server Error",
          });
          return;
        }
        if (result.length == 0) {
          unlinkSync("./uploads/operator/" + req.fileName);
          res.status(502).json({
            success: false,
            error: "Something went wrong. Please try again.",
          });
          return;
        } else {
          const check = checkUserData(operator);
          if (!check.result) {
            unlinkSync("./uploads/operator/" + req.fileName);
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
                unlinkSync("./uploads/operator/" + req.fileName);
                res.status(502).json({
                  success: false,
                  error: "Internal Server Error.",
                });
                return;
              }
              if (result.length == 0) {
                sharp("./uploads/operator/" + req.fileName)
                  .toFormat("jpeg")
                  .toFile(
                    "./uploads/operator/" + operator.operatorId + ".jpeg",
                    (err, info) => {
                      sqlQuery =
                        "INSERT INTO operator (operatorId, name, email, mobile, password, departmentId, active) VALUES ?";
                      db.query(sqlQuery, [[values]], (error, result) => {
                        if (error) {
                          unlinkSync("./uploads/operator/" + req.fileName);
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
                    }
                  );
              } else {
                unlinkSync("./uploads/operator/" + req.fileName);
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
  });
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
      } else {
        res.status(404).json({
          success: false,
          error: "No Operator Found.",
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

module.exports.activateOperator = async (req, res) => {
  let operatorId = req.params.operatorId;
  if (operatorId) {
    let sqlQuery = "SELECT * FROM operator where operatorId = ?";
    db.query(sqlQuery, [operatorId], (err, result) => {
      if (err) {
        res.status(502).json({
          success: false,
          error: toString(err),
        });
      }
      if (result.length == 1) {
        sqlQuery = "UPDATE operator SET active = 'Active' where operatorId = ?";
        db.query(sqlQuery, [operatorId], (err, result) => {
          if (err) {
            res.status(502).json({ success: false, error: toString(err) });
          }
          res.status(200).json({
            success: true,
            data: "Operator Activated Successfully.",
          });
        });
      } else {
        res.status(404).json({
          success: false,
          error: "No Operator Found.",
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

// get profile of admin
module.exports.getAdminProfile = async (req, res) => {
  const admin = req.admin;
  delete admin.id;
  delete admin.password;
  res.status(200).json({ success: true, data: { admin } });
};

// creating new Admin
module.exports.createNewAdmin = async (req, res) => {
  let admin = req.body;
  const check = checkUserData(admin);
  if (!check.result) {
    res.status(400).json({
      success: false,
      error: check.errors,
    });
    return;
  }

  admin.id = generateId();
  let originalPassword = admin.password;
  const newPassword = await hashPassword(admin.password);
  admin.password = newPassword;
  let values = [
    admin.id,
    admin.name,
    admin.email,
    admin.mobile,
    admin.password,
  ];
  let sqlQuery = "SELECT * FROM admin where email = ? OR mobile = ?";
  db.query(sqlQuery, [admin.email, admin.mobile], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    }
    if (result.length == 0) {
      sqlQuery =
        "INSERT INTO admin (id, name, email, mobile, password) VALUES ?";
      db.query(sqlQuery, [[values]], (error, result) => {
        if (error) {
          res.status(502).json({
            success: false,
            error: "Internal Server Error.",
          });
          return;
        } else {
          let sendOptions = {
            name: admin.name,
            email: admin.email,
            password: originalPassword,
            role: "Admin",
          };
          sendEmail(sendOptions);
          res.status(200).json({
            success: true,
            data: "Admin created successfully.",
          });
        }
      });
    } else {
      res.status(409).json({
        success: false,
        error:
          "Admin is already present on system with this mobile number or email.",
      });
    }
  });
};

// creating new Manager

module.exports.createNewProject = async (req, res) => {
  upload(req, res, async () => {
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

module.exports.logoutAdmin = async (req, res) => {
  res
    .clearCookie("jwt")
    .status(200)
    .json({ success: true, data: "Logged out successfully." });
};
