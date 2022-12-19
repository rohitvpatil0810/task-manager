const { createToken } = require("../utility/createJWToken");
const { checkPassword } = require("../utility/passwordManager");
const db = require("../database/db");
const maxAge = 3 * 24 * 60 * 60;

module.exports.loginOperator = async (req, res) => {
  let { email, password } = req.body;
  let sqlQuery = "SELECT * FROM operator WHERE email = ?";
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
      res.status(200).json({
        success: true,
        data: "status updated successfully.",
      });
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
