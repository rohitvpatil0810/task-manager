const db = require("../../database/db");
const { checkUserData } = require("../../utility/checkUserData");
const { createToken } = require("../../utility/createJWToken");
const { generateId } = require("../../utility/idGenerator");
const {
  hashPassword,
  checkPassword,
} = require("../../utility/passwordManager");
const maxAge = 3 * 24 * 60 * 60;
const { sendEmail } = require("../../utility/sendEmail");

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

module.exports.getAdminProfile = async (req, res) => {
  const admin = req.admin;
  delete admin.id;
  delete admin.password;
  res.status(200).json({ success: true, data: { admin } });
};

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

module.exports.logoutAdmin = async (req, res) => {
  res
    .clearCookie("jwt")
    .status(200)
    .json({ success: true, data: "Logged out successfully." });
};
