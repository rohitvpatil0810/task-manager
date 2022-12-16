const bcrypt = require("bcrypt");

module.exports.hashPassword = async (password) => {
  let salt = await bcrypt.genSalt();
  let newPassword = await bcrypt.hash(password, salt);
  return newPassword;
};

module.exports.checkPassword = async (password, hashPassword) => {
  const result = await bcrypt.compare(password, hashPassword);
  return result;
};
