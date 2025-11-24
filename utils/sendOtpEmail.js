// import transporter from "./mailTransporter.js";

// /**
//  * Send OTP email
//  * @param {string} to - Recipient email
//  * @param {string} otp - One-time password
//  */
// export const sendOtpEmail = async (to, otp) => {
//   const mailOptions = {
//     from: `"Seamless Art" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "Your One-Time Password (OTP) from Seamless Art",
//     html: `
//     <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
//       <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        
//         <!-- Logo at Top Center -->
//         <div style="text-align: center; margin: 20px;">
//           <img src="https://seamless-art-storage.s3.eu-north-1.amazonaws.com/logo/SeamlessArt+(1).png" alt="Seamless Art Logo" style="height: 20px;" />
//         </div>

//         <h2 style="color: #333;">Hi there 👋,</h2>
//         <p style="font-size: 16px; color: #555;">
//           You recently requested a one-time password (OTP) for authentication at <strong>Seamless Art</strong>.
//         </p>
//         <p style="font-size: 18px; margin: 20px 0; color: #333;">
//           Your OTP is:
//         </p>
//         <div style="font-size: 32px; font-weight: bold; color: #000; letter-spacing: 3px; padding: 12px 24px; background: #f0f0f0; display: inline-block; border-radius: 6px;">
//           ${otp}
//         </div>
//         <p style="margin-top: 20px; font-size: 14px; color: #777;">
//           This OTP is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone.
//         </p>
//         <p style="font-size: 14px; color: #777;">
//           If you didn't request this OTP, you can safely ignore this email.
//         </p>
//         <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
//         <p style="font-size: 14px; color: #999;">
//           Thanks,<br/>
//           The Seamless Art Team
//         </p>
//       </div>
//     </div>
//   `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`OTP email sent to ${to}`);
//   } catch (error) {
//     console.error("Error sending OTP email:", error);
//     throw new Error("Failed to send OTP email");
//   }
// };



import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to, otp) => {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to,
      subject: "Your One-Time Password (OTP) - Seamless Art",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Your OTP Code</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, ignore this message.</p>
        </div>
      `,
    });

    console.log("OTP email sent using Resend:", response);
    return response;

  } catch (error) {
    console.error("Resend OTP send error:", error);
    throw new Error("Failed to send OTP email");
  }
};
