import { sendOtpEmail } from "./sendOtpEmail.js";

export const generateAndSendOtp = async (user) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  await sendOtpEmail(user.email, otp);
};
