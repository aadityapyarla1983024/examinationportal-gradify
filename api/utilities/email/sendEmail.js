import nodemailer from "nodemailer";
import config from "../../../config/dev.js";

/**
 * Utility: Send an email using Nodemailer.
 *
 * @param {string} email - Recipient email address
 * @param {string} html - HTML content of the email
 * @returns {Promise<void>}
 */
export default async function sendEmail(email, html) {
  // Create a transporter using your mail configuration
  const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure, // true for 465, false for others
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });

  try {
    // Send the email
    await transporter.sendMail({
      from: `"Gradify" <${config.mail.user}>`,
      to: email,
      subject: "Gradify - Reset your password",
      html,
    });

    console.log(`✅ Email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
}
