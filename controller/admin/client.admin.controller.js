const db = require("../../database/db");
const { unlinkSync, existsSync } = require("fs");
const sharp = require("sharp");
const { uploadToClient } = require("../../middleware/multer.middleware");
const { checkUserData } = require("../../utility/checkUserData");
const { hashPassword } = require("../../utility/passwordManager");
const { sendEmail } = require("../../utility/sendEmail");
const { generateId } = require("../../utility/idGenerator");

module.exports.createNewClient = async (req, res) => {
  /*
   #swagger.consumes = ['multipart/form-data']  
   #swagger.autoBody = false
   #swagger.parameters['clientIcon'] ={
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
   #swagger.parameters['organization'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['password'] ={
      in: 'formData',
      type: 'text'
   } 
   */
  uploadToClient(req, res, async () => {
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
      if (existsSync("./uploads/client/" + req.fileName)) {
        unlinkSync("./uploads/client/" + req.fileName);
      }
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
        if (existsSync("./uploads/client/" + req.fileName)) {
          unlinkSync("./uploads/client/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          error: toString(err),
        });
        return;
      }
      if (result.length == 0) {
        sqlQuery =
          "INSERT INTO client (clientId, name, email, mobile, organization, password) VALUES ?";
        db.query(sqlQuery, [[values]], (error, result) => {
          if (error) {
            if (existsSync("./uploads/client/" + req.fileName)) {
              unlinkSync("./uploads/client/" + req.fileName);
            }
            res.status(502).json({
              success: false,
              error: toString(err),
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
            if (existsSync("./uploads/client/" + req.fileName)) {
              sharp("./uploads/client/" + req.fileName)
                .toFormat("jpeg")
                .toFile(
                  "./uploads/client/" + client.clientId + ".jpeg",
                  (err, info) => {
                    if (err) {
                      if (existsSync("./uploads/client/" + req.fileName)) {
                        unlinkSync("./uploads/client/" + req.fileName);
                      }
                      res.status(502).json({
                        success: false,
                        error: toString(err),
                      });
                    }
                    res.status(200).json({
                      success: true,
                      data: "Client created successfully.",
                    });
                  }
                );
            } else {
              res.status(200).json({
                success: true,
                data: "Client created successfully.",
              });
            }
          }
        });
      } else {
        if (existsSync("./uploads/client/" + req.fileName)) {
          unlinkSync("./uploads/client/" + req.fileName);
        }
        res.status(409).json({
          success: false,
          error:
            "Client is already present on system with this mobile number or email.",
        });
      }
    });
  });
};

module.exports.deleteClient = async (req, res) => {
  let clientId = req.params.clientId;
  if (clientId) {
    let sqlQuery = "SELECT * FROM client where clientId = ?";
    db.query(sqlQuery, [clientId], (err, result) => {
      if (err) {
        res.status(502).json({
          success: false,
          error: toString(err),
        });
      }
      if (result.length == 1) {
        sqlQuery = "UPDATE client SET active = 'Deleted' where clientId = ?";
        db.query(sqlQuery, [clientId], (err, result) => {
          if (err) {
            res.status(502).json({ success: false, error: toString(err) });
          }
          res.status(200).json({
            success: true,
            data: "Client Deleted Successfully.",
          });
        });
      } else {
        res.status(404).json({
          success: false,
          error: "No Client Found.",
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: "No Client Found.",
    });
  }
};

module.exports.activateClient = async (req, res) => {
  let clientId = req.params.clientId;
  if (clientId) {
    let sqlQuery = "SELECT * FROM client where clientId = ?";
    db.query(sqlQuery, [clientId], (err, result) => {
      if (err) {
        res.status(502).json({
          success: false,
          error: toString(err),
        });
      }
      if (result.length == 1) {
        sqlQuery = "UPDATE client SET active = 'Active' where clientId = ?";
        db.query(sqlQuery, [clientId], (err, result) => {
          if (err) {
            res.status(502).json({ success: false, error: toString(err) });
          }
          res.status(200).json({
            success: true,
            data: "Client Activated Successfully.",
          });
        });
      } else {
        res.status(404).json({
          success: false,
          error: "No Client Found.",
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: "No client Found.",
    });
  }
};

module.exports.getClients = async (req, res) => {
  let sqlQuery = "SELECT * FROM client where active = 'Active'";
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

module.exports.getDeactivatedClients = async (req, res) => {
  let sqlQuery = "SELECT * FROM client where active = 'Deleted'";
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

module.exports.editClient = async (req, res) => {
  /*
   #swagger.consumes = ['multipart/form-data']  
    #swagger.autoBody = false
   #swagger.parameters['clientIcon'] ={
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
   #swagger.parameters['organization'] ={
      in: 'formData',
      type: 'text'
   } 
   #swagger.parameters['password'] ={
      in: 'formData',
      type: 'text'
   } 
   */
  uploadToClient(req, res, async () => {
    const client = req.body;
    const clientId = req.params.clientId;
    console.log(clientId);
    let sqlQuery = "SELECT * FROM client WHERE clientId = ?";
    db.query(sqlQuery, [clientId], async (error, result) => {
      if (error) {
        if (existsSync("./uploads/client/" + req.fileName)) {
          unlinkSync("./uploads/client/" + req.fileName);
        }
        res.status(502).json({
          success: false,
          error: toString(err),
        });
        return;
      } else if (result.length == 1) {
        let values = [];
        if (client.password) {
          client.password = await hashPassword(client.password);
          sqlQuery =
            "UPDATE client SET name = ? , email = ? , mobile = ? , organization = ? , password = ? WHERE clientId = ?";
          values = [
            client.name,
            client.email,
            client.mobile,
            client.organization,
            client.password,
            clientId,
          ];
        } else {
          sqlQuery =
            "UPDATE client SET name = ? , email = ? , mobile = ?, organization = ? WHERE clientId = ?";
          values = [
            client.name,
            client.email,
            client.mobile,
            client.organization,
            clientId,
          ];
        }
        db.query(sqlQuery, values, (err, result) => {
          if (err) {
            if (existsSync("./uploads/client/" + req.fileName)) {
              unlinkSync("./uploads/client/" + req.fileName);
            }
            res.status(502).json({
              success: false,
              error: toString(err),
            });
            return;
          }
          if (existsSync("./uploads/client/" + req.fileName)) {
            sharp("./uploads/client/" + req.fileName)
              .toFormat("jpeg")
              .toFile("./uploads/client/" + clientId + ".jpeg", (err, info) => {
                if (err) {
                  unlinkSync("./uploads/client/" + req.fileName);
                  res.status(502).json({
                    success: false,
                    error: toString(err),
                  });
                  return;
                } else {
                  unlinkSync("./uploads/client/" + req.fileName);
                  res.status(200).json({
                    success: true,
                    data: "client Edited Successfully",
                  });
                }
              });
          } else {
            res.status(200).json({
              success: true,
              data: "client Edited Successfully",
            });
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: "No client Found.",
        });
      }
    });
  });
};
