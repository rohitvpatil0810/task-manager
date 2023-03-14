const db = require("../../database/db");
const { unlinkSync, existsSync } = require("fs");
const sharp = require("sharp");
const { uploadToOperator } = require("../../middleware/multer.middleware");
const { checkUserData } = require("../../utility/checkUserData");
const { hashPassword } = require("../../utility/passwordManager");
const { sendEmail } = require("../../utility/sendEmail");
const { generateId } = require("../../utility/idGenerator");

module.exports.createNewOperator = async (req, res) => {
  /*
  #swagger.consumes = ['multipart/form-data']
    #swagger.autoBody = false
   #swagger.parameters['operatorIcon'] ={
      in: 'formData',
      type: 'file'
   } 
   #swagger.parameters['name'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['email'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['mobile'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['password'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['departmentId'] ={
      in: 'formData',
      type: 'text'
   } 
   */
  uploadToOperator(req, res, async () => {
    let operator = req.body;
    console.log(operator);

    if (operator && !operator.departmentId) {
      if (existsSync("./uploads/operator/" + req.fileName)) {
        unlinkSync("./uploads/operator/" + req.fileName);
      }
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
          if (existsSync("./uploads/operator/" + req.fileName)) {
            unlinkSync("./uploads/operator/" + req.fileName);
          }
          res.status(502).json({
            success: false,
            error: "Internal Server Error",
          });
          return;
        }
        if (result.length == 0) {
          if (existsSync("./uploads/operator/" + req.fileName)) {
            unlinkSync("./uploads/operator/" + req.fileName);
          }
          res.status(502).json({
            success: false,
            error: "Something went wrong. Please try again.",
          });
          return;
        } else {
          const check = checkUserData(operator);
          if (!check.result) {
            if (existsSync("./uploads/operator/" + req.fileName)) {
              unlinkSync("./uploads/operator/" + req.fileName);
            }
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
                if (existsSync("./uploads/operator/" + req.fileName)) {
                  unlinkSync("./uploads/operator/" + req.fileName);
                }
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
                    if (existsSync("./uploads/operator/" + req.fileName)) {
                      sharp("./uploads/operator/" + req.fileName)
                        .toFormat("jpeg")
                        .toFile(
                          "./uploads/operator/" + operator.operatorId + ".jpeg",
                          (err, info) => {
                            if (err) {
                              unlinkSync("./uploads/operator" + req.fileName);
                              res.status(502).json({
                                success: false,
                                error:
                                  "operator created but profile pic is not uploaded. Please Try Again.",
                              });
                            }
                            res.status(200).json({
                              success: true,
                              data: "Operator created successfully.",
                            });
                          }
                        );
                    } else {
                      res.status(200).json({
                        success: true,
                        data: "Operator created successfully.",
                      });
                    }
                  }
                });
              } else {
                if (existsSync("./uploads/operator/" + req.fileName)) {
                  unlinkSync("./uploads/operator/" + req.fileName);
                }
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

module.exports.editOperator = async (req, res) => {
  /*
  #swagger.consumes = ['multipart/form-data']
    #swagger.autoBody = false
   #swagger.parameters['operatorIcon'] ={
      in: 'formData',
      type: 'file'
   } 
   #swagger.parameters['name'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['email'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['mobile'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['password'] ={
      in: 'formData',
      type: 'text'
   } 
   */
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
