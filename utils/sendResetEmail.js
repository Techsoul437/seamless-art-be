// import transporter from "./mailTransporter.js";

// export const sendResetEmail = async (email, frontendUrl) => {
//   const mailOptions = {
//     from: `"Seamless Art" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Reset Your Password - Seamless Art",
//     html: `
//   <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
//     <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      
//       <div style="text-align: center; margin: 20px;">
//         <img src="https://seamless-art-storage.s3.eu-north-1.amazonaws.com/logo/SeamlessArt+(1).png" alt="Seamless Art Logo" style="height: 20px;" />
//       </div>

//       <h2 style="color: #333;">Reset Your Password</h2>
//       <p style="font-size: 16px; color: #555;">
//         We received a request to reset your password for your <strong>Seamless Art</strong> account.
//       </p>
//       <p style="font-size: 16px; color: #555;">
//         Click the button below to set a new password. This link will expire in <strong>10 minutes</strong> for your security.
//       </p>
      
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${frontendUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">
//           Reset Password
//         </a>
//       </div>

//       <p style="font-size: 14px; color: #777;">
//         If you didn’t request this password reset, you can safely ignore this email.
//       </p>

//       <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

//       <p style="font-size: 14px; color: #999;">
//         Thanks,<br/>
//         The Seamless Art Team
//       </p>
//     </div>
//   </div>
//   `,
//   };

//   await transporter.sendMail(mailOptions);
// };



import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (email, frontendUrl) => {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: email,
      subject: "Reset Your Password - Seamless Art",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            
            <div style="text-align: center; margin: 20px;">
              <img src="https://seamless-art-storage.s3.eu-north-1.amazonaws.com/logo/SeamlessArt+(1).png" alt="Seamless Art Logo" style="height: 20px;" />
            </div>

            <h2 style="color: #333;">Reset Your Password</h2>
            <p style="font-size: 16px; color: #555;">
              We received a request to reset your password for your <strong>Seamless Art</strong> account.
            </p>
            <p style="font-size: 16px; color: #555;">
              Click the button below to set a new password. This link will expire in <strong>10 minutes</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <p style="font-size: 14px; color: #777;">
              If you didn’t request this password reset, just ignore this email.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

            <p style="font-size: 14px; color: #999;">
              Thanks,<br/>
              The Seamless Art Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("Resend reset email success:", response);
    return response;

  } catch (error) {
    console.error("Resend reset email error:", error);
    throw new Error("Failed to send reset password email");
  }
};
