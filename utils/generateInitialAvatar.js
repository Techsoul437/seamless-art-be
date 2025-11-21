import sharp from "sharp";
import { uploadAvatarToS3 } from "../services/s3AvatarService.js";

export const generateInitialAvatar = async (name) => {
  const initial = name?.charAt(0)?.toUpperCase() || "U";

  const svg = `
  <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#7e3230" />
    <text
      x="50%"
      y="50%"
      fill="#f9f5f1"
      font-size="160"
      font-weight="bold"
      font-family="Arial, sans-serif"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      ${initial}
    </text>
  </svg>`;

  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  // NEW FUNCTION
  return await uploadAvatarToS3(buffer);
};
