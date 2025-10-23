import config from "config";

export default function passwordResetEmail(resetLink, userName) {
  return `<center style="width: 100%; background-color: #f4f7fa; margin: 0; padding: 20px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); overflow: hidden;">
     
     <!-- === HEADER === -->
     <tr>
       <td align="center" style="background-color: #4CAF50; padding: 30px; text-align: center;">
         <!-- 
             !!! IMPORTANT !!!
             Replace 'image_73a878.png' with your publicly hosted logo URL 
         -->
         <img src="http://192.168.0.101:5184/gradifyfullogo.svg" alt="Gradify Logo" style="border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 150px; margin-bottom: 15px;">
         <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 600; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Gradify</h1>
       </td>
     </tr>
     
     <!-- === CONTENT === -->
     <tr>
       <td align="left" style="padding: 30px; line-height: 1.6; color: #555555; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px;">
         <h2 style="font-size: 24px; color: #333333; margin-top: 0; margin-bottom: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Password Reset Request</h2>
         <p style="margin-bottom: 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px;">Hello ${userName},</p>
         <p style="margin-bottom: 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px;">We received a request to reset the password for your Gradify account. If you made this request, please click the button below to set a new password:</p>
         
         <!-- === CTA BUTTON === -->
         <div style="text-align: center; padding: 20px 0;">
           <a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: #ffffff; padding: 12px 25px; border-radius: 5px; font-size: 16px; font-weight: bold; text-decoration: none; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);" target="_blank">
             Reset Password
           </a>
         </div>
         
         <p style="margin-bottom: 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px;">This password reset link is valid for <strong>5 min</strong>. For security reasons, if you don't reset your password within this timeframe, you will need to submit another request.</p>
         <p style="margin-bottom: 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
         <p style="margin-bottom: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px;">Thank you,<br>Team Gradify</p>
       </td>
     </tr>
     
     <!-- === FOOTER === -->
     <tr>
       <td align="center" style="background-color: #f0f0f0; padding: 25px; text-align: center; font-size: 13px; color: #888888; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
         <p style="margin: 0 0 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px;">&copy; 2023 Gradify. All rights reserved.</p>
         <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px;">
           <a href="http://${config.get("server.host")}:${config.get(
    "server.port"
  )}" style="color: #888888; text-decoration: underline;" target="_blank">Visit Gradify</a> |
           <a href="[PRIVACY_POLICY_LINK]" style="color: #888888; text-decoration: underline;" target="_blank">Privacy Policy</a>
         </p>
       </td>
     </tr>
   </table>
 </center>
 `;
}
