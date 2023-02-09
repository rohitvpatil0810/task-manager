const db = require("../database/db");
const { checkUserData } = require("../utility/checkUserData");
const { createToken } = require("../utility/createJWToken");
const { generateId } = require("../utility/idGenerator");
const { hashPassword, checkPassword } = require("../utility/passwordManager");
const maxAge = 3 * 24 * 60 * 60;
const { existsSync } = require("fs");
const { sendEmail } = require("../utility/sendEmail");

module.exports.getClientProfilePic = async (req, res) => {
  let clientId = req.params.clientId;
  if (existsSync("./uploads/client/" + clientId + ".jpeg")) {
    res.download("./uploads/client/" + clientId + ".jpeg");
  } else {
    res.status(404).json({
      success: false,
      error: "No profile pic found",
    });
  }
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

module.exports.getManagers = async (req, res) => {
  let sqlQuery = "SELECT * FROM manager";
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
module.exports.createNewManager = async (req, res) => {
  let manager = req.body;
  const check = checkUserData(manager);
  if (!check.result) {
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
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    }
    if (result.length == 0) {
      sqlQuery =
        "INSERT INTO manager (managerId, name, email, mobile, password) VALUES ?";
      db.query(sqlQuery, [[values]], (error, result) => {
        if (error) {
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
    } else {
      res.status(409).json({
        success: false,
        error:
          "Manager is already present on system with this mobile number or email.",
      });
    }
  });
};

// creating new Client
module.exports.createNewClient = async (req, res) => {
  let client = req.body;
  const check = checkUserData(client);
  if (!client.organization) {
    check.result = false;
    check.errors.organization = "Please enter organization name.";
  } else {
    if (client.organization.length < 3) {
      check.result = false;
      check.errors.organization =
        "Organization name should contain atleast 3 characters.";
    }
  }
  if (!check.result) {
    res.status(400).json({
      success: false,
      error: check.errors,
    });
    return;
  }

  client.clientId = generateId();
  let originalPassword = client.password;
  const newPassword = await hashPassword(client.password);
  client.password = newPassword;
  let values = [
    client.clientId,
    client.name,
    client.email,
    client.mobile,
    client.organization,
    client.password,
  ];
  let sqlQuery = "SELECT * FROM client where email = ? OR mobile = ?";
  db.query(sqlQuery, [client.email, client.mobile], (error, result) => {
    if (error) {
      res.status(502).json({
        success: false,
        error: "Internal Server Error.",
      });
      return;
    }
    if (result.length == 0) {
      sqlQuery =
        "INSERT INTO client (clientId, name, email, mobile, organization, password) VALUES ?";
      db.query(sqlQuery, [[values]], (error, result) => {
        if (error) {
          res.status(502).json({
            success: false,
            error: "Internal Server Error.",
          });
          return;
        } else {
          let sendOptions = {
            name: client.name,
            email: client.email,
            password: originalPassword,
            role: "Client",
          };
          sendEmail(sendOptions);
          res.status(200).json({
            success: true,
            data: "Client created successfully.",
          });
        }
      });
    } else {
      res.status(409).json({
        success: false,
        error:
          "Client is already present on system with this mobile number or email.",
      });
    }
  });
};

module.exports.logoutAdmin = async (req, res) => {
  res
    .clearCookie("jwt")
    .status(200)
    .json({ success: true, data: "Logged out successfully." });
};
