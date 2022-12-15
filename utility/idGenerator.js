const uuid = require("uuid");

module.exports.generateId = () => {
  return uuid.v4();
};
