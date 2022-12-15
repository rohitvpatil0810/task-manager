const { isEmail } = require("validator");

module.exports.checkUserData = (user) => {
  let result = true;
  let errors = {};
  if (user.email) {
    if (!isEmail(user.email)) {
      errors.email = "Please enter a valid email.";
      result = false;
    }
  } else {
    errors.email = "Please enter email.";
    result = false;
  }

  if (user.name) {
    if (user.name.length < 3) {
      errors.name = "Name must contain atleast 3 characters.";
      result = false;
    }
  } else {
    errors.name = "Please enter name.";
    result = false;
  }

  if (user.mobile) {
    if (user.mobile.length != 10) {
      errors.mobile = "Please enter valid mobile number.";
      result = false;
    }
  } else {
    errors.mobile = "Please enter mobile number.";
    result = false;
  }

  if (user.password) {
    if (user.password.length < 6) {
      errors.password = "Password must contain atleast 6 characters";
      result = false;
    }
  } else {
    errors.password = "Please enter password.";
    result = false;
  }
  return { result, errors };
};
