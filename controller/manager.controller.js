const { createToken } = require("../utility/createJWToken");
const { checkPassword } = require("../utility/passwordManager");
const db = require("../database/db");
const { generateId } = require("../utility/idGenerator");
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

// logout Manager
module.exports.logoutManager = async (req, res) => {
  res
    .clearCookie("jwt")
    .status(200)
    .json({ success: true, data: "Logged out successfully." });
};
