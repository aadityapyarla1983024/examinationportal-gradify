import config from "../../../../config/dev.js";

/**
 * Generates a styled HTML password reset email.
 *
 * @param {string} resetLink - The password reset URL
 * @param {string} userName - The user's full name
 * @returns {string} HTML string for the email body
 */
export default function passwordResetTemplate(resetLink, userName) {
  return `
  <center style="width: 100%; background-color: #f4f7fa; margin: 0; padding: 20px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); overflow: hidden;">
      
      <!-- HEADER -->
      <tr>
        <td align="center" style="background-color: #4CAF50; padding: 30px;">
          <img src="http://${config.server.front.host}:${
    config.server.front.port
  }/gradifyfullogo.svg"
            alt="Gradify Logo"
            style="max-width: 150px; margin-bottom: 15px;" />
          <h1 style="margin: 0; font-size: 28px; color: #ffffff;">Gradify</h1>
        </td>
      </tr>
      
      <!-- CONTENT -->
      <tr>
        <td style="padding: 30px; line-height: 1.6; color: #555555;">
          <h2 style="font-size: 24px; color: #333333; margin-top: 0;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset your Gradify account password. If you made this request, click below:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}"
              style="background-color: #4CAF50; color: #ffffff; padding: 12px 25px; border-radius: 5px;
              font-size: 16px; font-weight: bold; text-decoration: none; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"
              target="_blank">
              Reset Password
            </a>
          </div>

          <p>This link is valid for <strong>5 minutes</strong>. After that, you'll need to request again.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>Thank you,<br><strong>Team Gradify</strong></p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td align="center" style="background-color: #f0f0f0; padding: 25px; font-size: 13px; color: #888888;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Gradify. All rights reserved.</p>
          <p style="margin: 5px 0 0;">
            <a href="http://${config.server.front.host}:${
    config.server.front.port
  }" style="color: #888888; text-decoration: underline;">Visit Gradify</a> |
            <a href="[PRIVACY_POLICY_LINK]" style="color: #888888; text-decoration: underline;">Privacy Policy</a>
          </p>
        </td>
      </tr>
    </table>
  </center>`;
}
