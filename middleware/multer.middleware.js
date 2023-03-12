const multer = require("multer");

const uploadToProject = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/project");
    },
    filename: function (req, file, cb) {
      req.fileName = file.originalname;
      cb(null, req.fileName);
    },
  }),
}).single("projectIcon");

const uploadToManager = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/manager");
    },
    filename: function (req, file, cb) {
      req.fileName = file.originalname;
      cb(null, req.fileName);
    },
  }),
}).single("managerIcon");

const uploadToClient = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/client");
    },
    filename: function (req, file, cb) {
      req.fileName = file.originalname;
      cb(null, req.fileName);
    },
  }),
}).single("clientIcon");

const uploadToOperator = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/operator");
    },
    filename: function (req, file, cb) {
      req.fileName = file.originalname;
      cb(null, req.fileName);
    },
  }),
}).single("operatorIcon");

const uploadToDepartment = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/department");
    },
    filename: function (req, file, cb) {
      req.fileName = file.originalname;
      cb(null, req.fileName);
    },
  }),
}).single("departmentIcon");

module.exports = {
  uploadToClient,
  uploadToDepartment,
  uploadToManager,
  uploadToOperator,
  uploadToProject,
};
