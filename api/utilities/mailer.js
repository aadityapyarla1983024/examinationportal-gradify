import nodemailer from "nodemailer";
import config from "config";
export default async function sendEmail(email, html) {
  const transporter = nodemailer.createTransport({
    host: config.get("mail.host"),
    port: config.get("mail.port"),
    secure: config.get("mail.secure"),
    auth: {
      user: config.get("mail.user"),
      pass: config.get("mail.pass"),
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Gradify" <aaditya.pyarla@gmail.com>',
      to: `${email}`,
      subject: "Gradify - Reset your password",
      html,
    });
    console.log("Email sent: ", info);
  } catch (error) {
    console.log("Error sending email", error);
  }
}
