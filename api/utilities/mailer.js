import nodemailer from "nodemailer";
import config from "../../config/dev.js";

export default async function sendEmail(email, html) {
  const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Gradify" <aaditya.pyarla@gmail.com>',
      to: `${email}`,
      subject: "Gradify - Reset your password",
      html,
    });
  } catch (error) {
    console.log("Error sending email", error);
  }
}
