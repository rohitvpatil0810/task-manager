const db = require("../../database/db");
const { uploadToManager } = require("../../middleware/multer.middleware");
const sharp = require("sharp");
const { existsSync, unlinkSync } = require("fs");
const { sendEmail } = require("../../utility/sendEmail");
const { checkUserData } = require("../../utility/checkUserData");
const { generateId } = require("../../utility/idGenerator");
const { hashPassword } = require("../../utility/passwordManager");

module.exports.createNewManager = async (req, res) => {
  /*
    #swagger.autoBody = false
   #swagger.parameters['managerIcon'] ={
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
  uploadToManager(req, res, async () => {
    let manager = req.body;
    const check = checkUserData(manager);
    if (!check.result) {
      unlinkSync("./uploads/manager/" + req.fileName);
      res.status(400).json({
        success: false,
        error: check.errors,
      });
      return;
    }

    manager.managerId = generateId();
    let originalPassword = manager.password;
    const newPassword = await hashPassword(manager.password);
    manager.password = newPassword;
    let values = [
      manager.managerId,
      manager.name,
      manager.email,
      manager.mobile,
      manager.password,
    ];
    let sqlQuery = "SELECT * FROM manager where email = ? OR mobile = ?";
    db.query(sqlQuery, [manager.email, manager.mobile], (error, result) => {
      if (error) {
        unlinkSync("./uploads/manager/" + req.fileName);
        res.status(502).json({
          success: false,
          error: "Internal Server Error.",
        });
        return;
      }
      if (result.length == 0) {
        sharp("./uploads/manager/" + req.fileName)
          .toFormat("jpeg")
          .toFile(
            "./uploads/manager/" + manager.managerId + ".jpeg",
            (err, info) => {
              sqlQuery =
                "INSERT INTO manager (managerId, name, email, mobile, password) VALUES ?";
              db.query(sqlQuery, [[values]], (error, result) => {
                if (error) {
                  unlinkSync("./uploads/manager/" + req.fileName);
                  res.status(502).json({
                    success: false,
                    error: "Internal Server Error.",
                  });
                  return;
                } else {
                  let sendOptions = {
                    name: manager.name,
                    email: manager.email,
                    password: originalPassword,
                    role: "Manager",
                  };
                  sendEmail(sendOptions);
                  res.status(200).json({
                    success: true,
                    data: "Manager created successfully.",
                  });
                }
              });
            }
          );
      } else {
        unlinkSync("./uploads/manager/" + req.fileName);
        res.status(409).json({
          success: false,
          error:
            "Manager is already present on system with this mobile number or email.",
        });
      }
    });
  });
};

module.exports.activateManager = async (req, res) => {
  let managerId = req.params.managerId;
  if (managerId) {
    let sqlQuery = "SELECT * FROM manager where managerId = ?";
    db.query(sqlQuery, [managerId], (err, result) => {
      if (err) {
        res.status(502).json({
          success: false,
          error: toString(err),
        });
      }
      if (result.length == 1) {
        sqlQuery = "UPDATE manager SET active = 'Active' where managerId = ?";
        db.query(sqlQuery, [managerId], (err, result) => {
          if (err) {
            res.status(502).json({ success: false, error: toString(err) });
          }
          res.status(200).json({
            success: true,
            data: "Manager Activated Successfully.",
          });
        });
      } else {
        res.status(404).json({
          success: false,
          error: "No Manager Found.",
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: "No Manager Found.",
    });
  }
};

module.exports.deleteManager = async (req, res) => {
  let managerId = req.params.managerId;
  if (managerId) {
    let sqlQuery = "SELECT * FROM manager where managerId = ?";
    db.query(sqlQuery, [managerId], (err, result) => {
      if (err) {
        res.status(502).json({
          success: false,
          error: toString(err),
        });
      }
      if (result.length == 1) {
        sqlQuery = "UPDATE manager SET active = 'Deleted' where managerId = ?";
        db.query(sqlQuery, [managerId], (err, result) => {
          if (err) {
            res.status(502).json({ success: false, error: toString(err) });
          }
          res.status(200).json({
            success: true,
            data: "Manager Deleted Successfully.",
          });
        });
      } else {
        res.status(404).json({
          success: false,
          error: "No Manager Found.",
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: "No Manager Found.",
    });
  }
};

module.exports.getManagers = async (req, res) => {
  let sqlQuery = "SELECT * FROM manager where active = 'Active'";
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

module.exports.getDeactivatedManagers = async (req, res) => {
  let sqlQuery = "SELECT * FROM manager where active = 'Deleted'";
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

module.exports.getManagerProfilePic = async (req, res) => {
  let managerId = req.params.managerId;
  if (existsSync("./uploads/manager/" + managerId + ".jpeg")) {
    res.download("./uploads/manager/" + managerId + ".jpeg");
  } else {
    res.status(404).json({
      success: false,
      error: "No profile pic found",
    });
  }
};

module.exports.editManager = async (req, res) => {
  /*
    #swagger.autoBody = false
   #swagger.parameters['managerIcon'] ={
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
  uploadToManager(req, res, async () => {
    const manager = req.body;
    const managerId = req.params.managerId;
    let sqlQuery = "SELECT * FROM manager WHERE managerId = ?";
    db.query(sqlQuery, [managerId], async (error, result) => {
      if (error) {
        if (existsSync("./uploads/manager/" + req.fileName)) {
          unlinkSync("./uploads/manager/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          error: toString(err),
        });
        return;
      } else if (result.length == 1) {
        let values = [];
        if (manager.password) {
          manager.password = await hashPassword(manager.password);
          sqlQuery =
            "UPDATE manager SET name = ? , email = ? , mobile = ? , password = ? WHERE managerId = ?";
          values = [
            manager.name,
            manager.email,
            manager.mobile,
            manager.password,
            managerId,
          ];
        } else {
          sqlQuery =
            "UPDATE manager SET name = ? , email = ? , mobile = ? WHERE managerId = ?";
          values = [manager.name, manager.email, manager.mobile, managerId];
        }
        db.query(sqlQuery, values, (err, result) => {
          if (err) {
            if (existsSync("./uploads/manager/" + req.fileName)) {
              unlinkSync("./uploads/manager/" + req.fileName);
            }
            res.status(502).json({
              success: false,
              error: toString(err),
            });
            return;
          }
          if (existsSync("./uploads/manager/" + req.fileName)) {
            sharp("./uploads/manager/" + req.fileName)
              .toFormat("jpeg")
              .toFile(
                "./uploads/manager/" + managerId + ".jpeg",
                (err, info) => {
                  if (err) {
                    unlinkSync("./uploads/manager/" + req.fileName);
                    res.status(502).json({
                      success: false,
                      error: toString(err),
                    });
                    return;
                  } else {
                    unlinkSync("./uploads/manager/" + req.fileName);
                    res.status(200).json({
                      success: true,
                      data: "Manager Edited Successfully",
                    });
                  }
                }
              );
          } else {
            res.status(200).json({
              success: true,
              data: "Manager Edited Successfully",
            });
          }
        });
      }
    });
  });
};
