const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");

const transponder = nodemailer.createTransport({
  pool: true,
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

let emailTemplate =
  '<p>Dear {{name}},&nbsp;</p><p><span>&nbsp;&nbsp; &nbsp;</span>We are excited to inform you that your account has been successfully created on Task Manager as {{role}}. You can now start using the app to manage your work.</p><p><span>&nbsp;&nbsp; &nbsp;</span>Your login credentials are as follows:</p><p></p><ul style="text-align: left;"></ul><p></p><ul style="text-align: left;"><li>Email: {{email}}</li><li>Password: {{password}}</li></ul><div>To log in, please visit <a href="https://www.google.com/">https://www.google.com/</a> and enter your email and password.&nbsp;</div><div><br /></div><div>If you have any questions or issues, please do not hesitate to contact us. We are here to help you.&nbsp;</div><div><br /></div><div>Best regards,&nbsp;</div><div>Task Manager Support Team</div><div><br /></div>';

module.exports.sendEmail = async (data) => {
  let template = Handlebars.compile(emailTemplate);

  let result = template(data);
  let mailOptions = {
    from: process.env.EMAIL,
    to: data.email,
    subject: "Your account has been created on Task Manager App",
    html: result,
  };

  transponder.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("EMAIL IS NOT SENT", err);
    } else {
      console.log("EMAIL IS SENT SUCCESSFULLY.");
    }
  });
};
