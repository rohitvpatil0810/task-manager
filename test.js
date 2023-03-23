const bcrypt = require("bcrypt");
const uuid = require("uuid");
const hashPassword = async (password) => {
  let salt = await bcrypt.genSalt();
  let newPassword = await bcrypt.hash(password, salt);
  return newPassword;
};

console.log(uuid.v4());

const test = async () => console.log(await hashPassword("admin123"));
test();
