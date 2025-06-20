import CryptoJS from "crypto-js";

export const createResetToken = () => {
  const rawToken = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
  const hashedToken = CryptoJS.SHA256(rawToken).toString(CryptoJS.enc.Hex);
  return { rawToken, hashedToken };
};
