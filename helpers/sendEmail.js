require("dotenv").config();

const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

const sendEmail = async (message) => {
  message.from = "alex_akvalang@ukr.net";

  return transport.sendMail(message);
};

module.exports = sendEmail;
